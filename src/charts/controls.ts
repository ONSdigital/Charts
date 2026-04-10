import { deepMerge } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  ConfigValue,
  ControlConfig,
  ControlOptionValue,
  ControlSelectionValue,
  DeepPartial,
  NormalizedDataset,
  ResolvedChartConfig,
} from "../types";
import { rebuildDataset } from "../data";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as unknown as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]),
    ) as T;
  }

  return value;
}

function areValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function asMultipleValue(
  value: ControlSelectionValue,
): readonly ControlOptionValue[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function setValueAtPath<TConfig>(
  config: TConfig,
  path: string,
  value: ConfigValue,
): TConfig {
  const segments = path.split(".").filter(Boolean);

  if (segments.length === 0) {
    return config;
  }

  const rootClone = cloneValue(config) as Record<string, unknown>;
  let cursor = rootClone;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = cloneValue(value);
      return;
    }

    const nextValue = cursor[segment];

    cursor[segment] = isPlainObject(nextValue)
      ? { ...nextValue }
      : {};
    cursor = cursor[segment] as Record<string, unknown>;
  });

  return rootClone as TConfig;
}

function requiresOptions(control: ControlConfig): NonNullable<ControlConfig["options"]> {
  if (control.options === undefined || control.options.length === 0) {
    throw new Error(`Control "${control.id}" requires at least one option.`);
  }

  return control.options;
}

function hasMatchingOption(
  control: ControlConfig,
  value: ControlOptionValue,
): boolean {
  if (control.options === undefined) {
    return true;
  }

  return control.options.some((option) => areValuesEqual(option.value, value));
}

function normaliseControlValue(
  control: ControlConfig,
  currentValue: ControlSelectionValue,
): ControlSelectionValue {
  if (currentValue === undefined) {
    return control.defaultValue === undefined
      ? undefined
      : cloneValue(control.defaultValue);
  }

  if (control.multiple) {
    const values = asMultipleValue(currentValue).filter((value) =>
      hasMatchingOption(control, value),
    );

    return values.length === 0 ? undefined : values;
  }

  return hasMatchingOption(control, currentValue as ControlOptionValue)
    ? cloneValue(currentValue)
    : control.defaultValue === undefined
      ? undefined
      : cloneValue(control.defaultValue);
}

function matchesControlValue(rowValue: unknown, selectedValue: ControlOptionValue): boolean {
  if (rowValue === selectedValue) {
    return true;
  }

  if (
    typeof rowValue === "object" &&
    rowValue !== null &&
    typeof selectedValue === "object" &&
    selectedValue !== null
  ) {
    return areValuesEqual(rowValue, selectedValue);
  }

  return String(rowValue) === String(selectedValue);
}

function setButtonActiveState(button: HTMLButtonElement, isActive: boolean): void {
  button.classList.toggle("ons-charts-control__button--active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
}

function createLabel(control: ControlConfig): HTMLLabelElement | undefined {
  if (control.label === undefined || control.type === "toggle") {
    return undefined;
  }

  const label = document.createElement("label");
  label.className = "ons-charts-control__label ons-label";
  label.textContent = control.label;
  return label;
}

export function resolveControlValues(
  controls: readonly ControlConfig[],
  currentValues: Record<string, ControlSelectionValue>,
): Record<string, ControlSelectionValue> {
  const nextValues = { ...currentValues };

  controls.forEach((control) => {
    nextValues[control.id] = normaliseControlValue(control, nextValues[control.id]);
  });

  return nextValues;
}

export function applyControlConfigState<TConfig>(options: {
  config: TConfig;
  controls: readonly ControlConfig[];
  values: Record<string, ControlSelectionValue>;
}): TConfig {
  return options.controls.reduce((activeConfig, control) => {
    if (control.action !== "config-swap") {
      return activeConfig;
    }

    const selectedValue = options.values[control.id];

    if (selectedValue === undefined) {
      return activeConfig;
    }

    if (control.field === undefined || control.field.length === 0) {
      if (!isPlainObject(selectedValue)) {
        throw new Error(
          `Control "${control.id}" must provide an object value when config-swap has no field.`,
        );
      }

      return deepMerge(
        activeConfig,
        selectedValue as DeepPartial<TConfig>,
      ) as TConfig;
    }

    return setValueAtPath(
      activeConfig,
      control.field,
      selectedValue as ConfigValue,
    );
  }, cloneValue(options.config));
}

export function applyControlDataState<TConfig extends BaseChartConfig>(options: {
  config: ResolvedChartConfig<TConfig>;
  data: NormalizedDataset;
  values: Record<string, ControlSelectionValue>;
}): {
  config: ResolvedChartConfig<TConfig>;
  data: NormalizedDataset;
} {
  let activeConfig = options.config;
  let filteredRows = options.data.rows;

  options.config.controls.forEach((control) => {
    const selectedValue = options.values[control.id];

    if (selectedValue === undefined) {
      return;
    }

    if (control.action === "filter") {
      if (control.field === undefined || control.field.length === 0) {
        throw new Error(`Filter control "${control.id}" requires a field.`);
      }

      const selectedValues = control.multiple
        ? asMultipleValue(selectedValue)
        : [selectedValue];

      filteredRows = filteredRows.filter((row) =>
        selectedValues.some((value) => matchesControlValue(row[control.field!], value)),
      );
      return;
    }

    if (control.action === "series-toggle") {
      const selectedValues = control.multiple
        ? asMultipleValue(selectedValue)
        : [selectedValue];
      const selectedSeriesIds = new Set(selectedValues.map((value) => String(value)));

      activeConfig = {
        ...activeConfig,
        series: activeConfig.series.filter((series) =>
          selectedSeriesIds.has(series.id) ||
          selectedSeriesIds.has(series.key ?? "") ||
          selectedSeriesIds.has(series.label ?? ""),
        ),
      };
    }
  });

  return {
    config: activeConfig,
    data: rebuildDataset({
      columns: options.data.columns,
      config: activeConfig,
      input: options.data.input,
      rows: filteredRows,
    }),
  };
}

export function renderControls(options: {
  controls: readonly ControlConfig[];
  controlValues: Record<string, ControlSelectionValue>;
  onChange: (control: ControlConfig, value: ControlSelectionValue) => void;
  registerCleanup: (cleanup: () => void) => () => void;
  targetBottom: HTMLDivElement;
  targetTop: HTMLDivElement;
}): void {
  const topControls = options.controls.filter(
    (control) => (control.position ?? "top") === "top",
  );
  const bottomControls = options.controls.filter(
    (control) => control.position === "bottom",
  );

  options.targetTop.replaceChildren();
  options.targetBottom.replaceChildren();
  options.targetTop.hidden = topControls.length === 0;
  options.targetBottom.hidden = bottomControls.length === 0;

  const renderControl = (control: ControlConfig, target: HTMLDivElement) => {
    const wrapper = document.createElement("div");
    wrapper.className = "ons-charts-control ons-field";

    const label = createLabel(control);

    if (label !== undefined) {
      wrapper.append(label);
    }

    if (control.type === "dropdown") {
      const select = document.createElement("select");
      const currentValue = options.controlValues[control.id];
      const controlOptions = requiresOptions(control);

      select.className = "ons-charts-control__select ons-select ons-input";
      select.multiple = control.multiple ?? false;

      if (!select.multiple) {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = control.label ?? "Select an option";
        placeholder.selected = currentValue === undefined;
        select.append(placeholder);
      }

      controlOptions.forEach((option, index) => {
        const optionElement = document.createElement("option");
        const isSelected = control.multiple
          ? asMultipleValue(currentValue).some((value) => areValuesEqual(value, option.value))
          : currentValue !== undefined && areValuesEqual(currentValue, option.value);

        optionElement.value = String(index);
        optionElement.textContent = option.label;
        optionElement.selected = isSelected;
        select.append(optionElement);
      });

      const changeHandler = () => {
        if (select.multiple) {
          const selectedValues = Array.from(select.selectedOptions).map(
            (selectedOption) =>
              controlOptions[Number(selectedOption.value)]!.value,
          );

          options.onChange(
            control,
            selectedValues.length === 0 ? undefined : selectedValues,
          );
          return;
        }

        if (select.value === "") {
          options.onChange(control, undefined);
          return;
        }

        options.onChange(control, controlOptions[Number(select.value)]!.value);
      };

      select.addEventListener("change", changeHandler);
      options.registerCleanup(() =>
        select.removeEventListener("change", changeHandler),
      );
      wrapper.append(select);
      target.append(wrapper);
      return;
    }

    if (control.type === "button-group") {
      const currentValue = options.controlValues[control.id];
      const group = document.createElement("div");
      const controlOptions = requiresOptions(control);

      group.className = "ons-charts-control__buttons ons-btn-group";
      group.setAttribute("role", "group");

      controlOptions.forEach((option) => {
        const button = document.createElement("button");
        const isActive = control.multiple
          ? asMultipleValue(currentValue).some((value) => areValuesEqual(value, option.value))
          : currentValue !== undefined && areValuesEqual(currentValue, option.value);

        button.type = "button";
        button.className = "ons-charts-control__button ons-btn ons-btn--secondary";
        button.textContent = option.label;
        setButtonActiveState(button, isActive);

        const clickHandler = () => {
          if (control.multiple) {
            const nextValues = asMultipleValue(currentValue);
            const nextSelection = nextValues.some((value) => areValuesEqual(value, option.value))
              ? nextValues.filter((value) => !areValuesEqual(value, option.value))
              : [...nextValues, option.value];

            options.onChange(
              control,
              nextSelection.length === 0 ? undefined : nextSelection,
            );
            return;
          }

          options.onChange(control, option.value);
        };

        button.addEventListener("click", clickHandler);
        options.registerCleanup(() =>
          button.removeEventListener("click", clickHandler),
        );
        group.append(button);
      });

      wrapper.append(group);
      target.append(wrapper);
      return;
    }

    if (control.type === "toggle") {
      const currentValue = options.controlValues[control.id];
      const optionsList = control.options ?? [];
      const checkedValue = optionsList[0]?.value ?? true;
      const uncheckedValue = optionsList[1]?.value;
      const labelText = optionsList[0]?.label ?? control.label ?? control.id;
      const toggleLabel = document.createElement("label");
      const checkbox = document.createElement("input");
      const text = document.createElement("span");
      const isChecked =
        currentValue !== undefined && areValuesEqual(currentValue, checkedValue);

      toggleLabel.className = "ons-charts-control__toggle ons-checkbox__label";
      checkbox.type = "checkbox";
      checkbox.className = "ons-charts-control__checkbox ons-checkbox";
      checkbox.checked = isChecked;
      text.className = "ons-charts-control__toggle-text";
      text.textContent = labelText;
      toggleLabel.append(checkbox, text);

      const changeHandler = () => {
        options.onChange(
          control,
          checkbox.checked ? checkedValue : uncheckedValue,
        );
      };

      checkbox.addEventListener("change", changeHandler);
      options.registerCleanup(() =>
        checkbox.removeEventListener("change", changeHandler),
      );
      wrapper.append(toggleLabel);
      target.append(wrapper);
      return;
    }

    throw new Error(`Unsupported control type "${control.type}" for control "${control.id}".`);
  };

  topControls.forEach((control) => renderControl(control, options.targetTop));
  bottomControls.forEach((control) =>
    renderControl(control, options.targetBottom),
  );
}

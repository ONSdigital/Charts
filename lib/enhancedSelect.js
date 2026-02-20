export class EnhancedSelect {
    constructor(config) {
        this.options = config.options || [];
        this.containerId = config.containerId || 'autocomplete';
        this.label = config.label || 'Select an option';
        this.hideLabel = config.hideLabel || false;
        this.mode = config.mode || 'default';
        this.placeholder = config.placeholder || (this.mode === 'search' ? 'Enter text' : 'Select one');
        this.idKey = config.idKey || 'id';
        this.labelKey = config.labelKey || 'label';
        this.groupKey = config.groupKey || null;
        this.onChange = config.onChange || (() => { });
        this.minLength = this.mode === 'search' ? 3 : 0;
        this.showClear = config.showClear !== undefined ? config.showClear : true;
        this.showAllOnFocus = config.showAllOnFocus !== undefined ? config.showAllOnFocus : (this.mode === 'default');
        this.forceShowAll = false;

        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }

        if (this.label && !this.hideLabel) {
            const label = document.createElement('label');
            label.htmlFor = `${this.containerId}-input`;
            label.textContent = this.label;
            this.container.appendChild(label);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'ons-autocomplete';
        this.container.appendChild(wrapper);
        this.wrapper = wrapper;

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'autocomplete__input-wrapper';
        wrapper.appendChild(inputWrapper);

        // Initialize the autocomplete after appending inputWrapper
        this.autocomplete = accessibleAutocomplete({
            element: inputWrapper,
            id: `${this.containerId}-input`,
            source: this.suggest.bind(this),
            autoselect: this.mode === 'search',
            onConfirm: this.select.bind(this),
            placeholder: this.placeholder,
            displayMenu: 'overlay',
            showAllValues: this.mode === 'default',
            dropdownArrow: (opts) => this.createChevron(opts),
            minLength: this.minLength,
            templates: {
                inputValue: this.inputValueTemplate.bind(this),
                suggestion: this.suggestionTemplate.bind(this)
            }
        });

        const input = inputWrapper.querySelector('.autocomplete__input');
        if (input && this.showAllOnFocus) {
            input.addEventListener('focus', () => {
                this.forceShowAll = true;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });

            input.addEventListener('click', () => {
                this.forceShowAll = true;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }

        // Now add the clear button if needed
        if (this.showClear) {
            this.addClearButton(inputWrapper);
        }

        const input = inputWrapper.querySelector('.autocomplete__input');
        if (input) {
            input.addEventListener('mousedown', () => this.releaseMenuHide());
            input.addEventListener('focus', () => this.releaseMenuHide());
        }

        this.addStyles();
    }

    addClearButton(wrapper) {
        const input = wrapper.querySelector('.autocomplete__input');
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'autocomplete__clear-button hidden';
        clearButton.setAttribute('aria-label', 'Clear selection');
        clearButton.innerHTML = this.createClearIcon();
      
        // Add event listener to clear button
        clearButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.clear();
        });
      
        // Add input event listener to toggle clear button visibility
        input.addEventListener('input', () => {
          const hasValue = input.value;
          clearButton.classList.toggle('hidden', !hasValue);  // Toggle visibility based on input value
          wrapper.classList.toggle('visible-clear', hasValue);  // Add/remove the 'visible-clear' class
        });
      
        // Add selection event listener to show the clear button when an option is selected
        input.addEventListener('change', () => {
          const hasValue = input.value;
          clearButton.classList.toggle('hidden', !hasValue);  // Toggle visibility after selection
          wrapper.classList.toggle('visible-clear', hasValue);  // Add/remove the 'visible-clear' class
        });
      
        // Append the clear button to the wrapper
        wrapper.appendChild(clearButton);
      }
      

    createClearIcon() {
        return `
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 14 14" width="18">
                    <path fill="currentColor" d="M13.6 1 l -0.71 -0.71 a 0.5 0.5 0 0 0 -0.71 0 l -5.25 5.25 l -5.25 -5.25 a 0.51 0.51 0 0 0 -0.71 0 l -0.71 0.71 a 0.5 0.5 0 0 0 0 0.71 l 5.25 5.25 l -5.25 5.25 a 0.5 0.5 0 0 0 0 0.71 l 0.71 0.71 a 0.5 0.5 0 0 0 0.71 0 l 5.25 -5.25 l 5.25 5.25 a 0.5 0.5 0 0 0 0.71 0 l 0.71 -0.71 a 0.5 0.5 0 0 0 0 -0.71 l -5.25 -5.25 l 5.25 -5.25 a 0.5 0.5 0 0 0 0 -0.71Z"></path>
                </svg>
      `;
    }

    clear() {
        const shouldHideMenu = this.mode === 'default';
        if (shouldHideMenu) {
            this.setMenuHidden(true);
        }
        this.setAutocompleteValue('');
        if (!shouldHideMenu) {
            this.closeMenu();
        }
        const input = this.container.querySelector('.autocomplete__input');
        if (input) {
            if (this.mode === 'search') {
                input.focus();
            } else {
                input.blur();
            }
        }
        // Ensure any menu reopened by input events is closed.
        if (this.hideMenuTimeout) {
            clearTimeout(this.hideMenuTimeout);
        }
        this.hideMenuTimeout = setTimeout(() => {
            if (shouldHideMenu) {
                this.closeMenu();
            }
            if (shouldHideMenu) {
                this.setMenuHidden(false);
            }
            this.hideMenuTimeout = null;
        }, 120);
        this.onChange(null);
    }

    setMenuHidden(hidden) {
        if (!this.wrapper) return;
        this.wrapper.classList.toggle('hide-menu', hidden);
    }

    releaseMenuHide() {
        if (this.hideMenuTimeout) {
            clearTimeout(this.hideMenuTimeout);
            this.hideMenuTimeout = null;
        }
        this.setMenuHidden(false);
        const menu = this.container ? this.container.querySelector('.autocomplete__menu') : null;
        if (menu && menu.hasAttribute('hidden')) {
            menu.removeAttribute('hidden');
        }
    }

    closeMenu() {
        const menu = this.container.querySelector('.autocomplete__menu');
        const input = this.container.querySelector('.autocomplete__input');
        const hasHideResults = this.autocomplete && typeof this.autocomplete.hideResults === 'function';

        if (hasHideResults) {
            this.autocomplete.hideResults();
        }

        if (menu && !hasHideResults) {
            menu.classList.remove('autocomplete__menu--visible');
            menu.setAttribute('hidden', '');
            // Avoid forcing inline display styles so the menu can reopen.
            menu.style.display = '';
        }

        if (input) {
            input.setAttribute('aria-expanded', 'false');
        }
    }

    suggest(query, populateResults) {
        const sanitizedQuery = query.replace(/[^\w\s]/gi, '');
        const shouldShowAll = this.forceShowAll || !sanitizedQuery;
        const filteredResults = shouldShowAll
            ? this.options
            : this.options.filter(opt =>
                opt[this.labelKey].match(new RegExp(`\\b${sanitizedQuery}`, 'i'))
            );

        populateResults(filteredResults);
        this.forceShowAll = false;
    }

    select(option) {
        if (option) {
            const selectedValue = this.options.find(opt => opt[this.idKey] === option[this.idKey]);
            this.onChange(selectedValue);
            this.setAutocompleteValue(option[this.labelKey]);
        }
    }

    setAutocompleteValue(value) {
        const input = this.container.querySelector('.autocomplete__input');

        if (this.autocomplete && typeof this.autocomplete.setValue === 'function') {
            this.autocomplete.setValue(value);
        } else if (input) {
            input.value = value;
        }

        if (input) {
            // Keep clear button visibility and autocomplete state in sync.
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    inputValueTemplate(result) {
        return result && result[this.labelKey];
    }

    suggestionTemplate(result) {
        if (!result) return '';
        return this.groupKey
            ? `${result[this.labelKey]} <span class="muted-text">${result[this.groupKey]}</span>`
            : result[this.labelKey];
    }

        createChevron(opts) {
                return `
                <svg class="${opts?.className}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 11.75 7.7" width="18" style="z-index:1">
                    <path fill="currentColor" d="m1.37.15 4.5 5.1 4.5-5.1a.37.37 0 0 1 .6 0l.7.7a.45.45 0 0 1 0 .5l-5.5 6.2a.37.37 0 0 1-.6 0l-5.5-6.1a.64.64 0 0 1 0-.6l.7-.7a.64.64 0 0 1 .6 0Z"></path>
                </svg>
            `;
        }

    addStyles() {
        const styles = `
        .ons-autocomplete .autocomplete__input {
            border-radius: 4px !important;
            border-width: 1px !important;
            width: 100% !important;
            padding-right: 30px;  /* Allow space for the clear button */
        }

        .ons-autocomplete .autocomplete__input--focused {
            box-shadow: inset 0 0 0 1px black !important;
            outline-color: #fbc900 !important;
        }

        .ons-autocomplete .autocomplete__dropdown-arrow-down {
            width: 18px !important;
            transform: translateY(-2px);
        }

        .ons-autocomplete .muted-text {
            opacity: 0.8;
            font-size: smaller;
        }

        .ons-autocomplete .autocomplete__input-wrapper {
            position: relative;
            display: flex;
            width: 100%;  /* Ensure the wrapper spans the full width */
        }

        .ons-autocomplete .autocomplete__clear-button {
            position: absolute;
            right: 10px;  /* Adjust position of the clear button inside the input */
            top: 50%;
            transform: translateY(-50%);  /* Center vertically */
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: #222222  ;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            z-index: 1;  /* Ensure the button is above the input field */
        }

        .ons-autocomplete .autocomplete__clear-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .ons-autocomplete .autocomplete__clear-button:focus {
            outline: 2px solid #fbc900;
            outline-offset: 2px;
        }

        .ons-autocomplete .autocomplete__clear-button.hidden {
            display: none;
        }

            /* Hide chevron when clear button is visible */
        .ons-autocomplete .autocomplete__input-wrapper.visible-clear .autocomplete__dropdown-arrow-down {
            display: none;
        }

        .ons-autocomplete.hide-menu .autocomplete__menu {
            display: none !important;
        }


        .ons-autocomplete .autocomplete__wrapper {
            position: relative;
            width: 100%;
        }
        `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }

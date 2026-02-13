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
            dropdownArrow: () => this.createChevron(),
            minLength: this.minLength,
            templates: {
                inputValue: this.inputValueTemplate.bind(this),
                suggestion: this.suggestionTemplate.bind(this)
            }
        });

        // Now add the clear button if needed
        if (this.showClear) {
            this.addClearButton(inputWrapper);
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
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }

    clear() {
        const input = this.container.querySelector('.autocomplete__input');
        if (input) {
            input.value = '';
            // Trigger input event to update accessible-autocomplete's internal state
            input.dispatchEvent(new Event('input', { bubbles: true }));
            this.closeMenu();
            input.focus();
        }
        this.onChange(null);
    }

    closeMenu() {
        const menu = this.container.querySelector('.autocomplete__menu');
        const input = this.container.querySelector('.autocomplete__input');

        if (menu) {
            menu.classList.remove('autocomplete__menu--visible');
            menu.style.display = 'none';
            menu.setAttribute('hidden', '');
        }

        if (input) {
            input.setAttribute('aria-expanded', 'false');
        }
    }

    suggest(query, populateResults) {
        const filteredResults = this.options.filter(opt =>
            opt[this.labelKey].match(new RegExp(`\\b${query.replace(/[^\w\s]/gi, '')}`, 'i'))
        );
        populateResults(filteredResults);
    }

    select(option) {
        if (option) {
            const selectedValue = this.options.find(opt => opt[this.idKey] === option[this.idKey]);
            this.onChange(selectedValue);
            // Manually trigger the input event to update the clear button visibility after selection
            const input = this.container.querySelector('.autocomplete__input');
            input.value = option[this.labelKey];  // Update input value with the selected label
            input.dispatchEvent(new Event('input', { bubbles: true }));  // Trigger input event to toggle clear button visibility
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

    createChevron() {
        return `
        <svg class="autocomplete__dropdown-arrow-down" viewBox="0 0 512 512">
          <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"/>
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

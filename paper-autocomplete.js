import {PolymerElement,html} from '@polymer/polymer/polymer-element.js';
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/iron-icons/iron-icons.js";
import "./paper-autocomplete-suggestions.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-ripple/paper-ripple.js";
import "@polymer/paper-material/paper-material.js";

class PaperAutocomplete extends PolymerElement {

  static get template() {
    return html`
        <style>
          :host {
            display: block;
            box-sizing: border-box;
            position: relative;

            --paper-input-container-focus-color: var(--primary-color);

            --paper-icon-button: {
              height: 24px;
              width: 24px;
              padding: 2px;
            }

            --paper-input-container-ms-clear: {
              display: none;
            }
          }

          .input-wrapper {
            @apply --layout-horizontal;
          }

          .input-wrapper paper-input {
            @apply --layout-flex;
          }

          #clear {
            display: none;
            line-height: 8px;
          }

          .sr-only {
            position: absolute;
            clip: rect(1px, 1px, 1px, 1px);
          }

          paper-autocomplete-suggestions {
            --suggestions-wrapper: {
              @apply --paper-autocomplete-suggestions-wrapper;
            };

            --paper-item-min-height: var(--paper-autocomplete-suggestions-item-min-height, 36px);
          }
        </style>

        <div class="input-wrapper" role="combobox" aria-haspopup="true" aria-owns="suggestionsWrapper" aria-expanded$="[[_isSuggestionsOpened]]">
          <!-- For accessibility, it is needed to have a label or aria-label. Label is preferred -->
          <label for="autocompleteInput" class="sr-only">[[label]]</label>

          <!-- Adding a hidden input to integrate with iron-form, if required -->
          <input type="hidden" name$="[[name]]" value$="[[value]]" >

          <paper-input 
            id="autocompleteInput"
            label="[[label]]"
            autocapitalize="[[autocapitalize]]"
            no-label-float="[[noLabelFloat]]"
            disabled="{{disabled}}"
            readonly="[[readonly]]"
            focused="{{focused}}"
            auto-validate$="[[autoValidate]]"
            error-message$="[[errorMessage]]"
            required$="[[required]]"
            value="{{text}}"
            allowed-pattern="[[allowedPattern]]"
            pattern="[[pattern]]"
            no-label-float="[[noLabelFloat]]"
            always-float-label="[[alwaysFloatLabel]]"
            char-counter$="[[charCounter]]"
            maxlength$="[[maxlength]]"
            placeholder="[[placeholder]]"
            invalid="{{invalid}}"

            role="textbox"
            aria-autocomplete="list"
            aria-multiline="false"
            aria-activedescendant$="[[_highlightedSuggestion.elementId]]"
            aria-disabled$="[[disabled]]"
            aria-controls="autocompleteStatus suggestionsWrapper">

            <slot name="prefix" slot="prefix"></slot>
            <!-- TODO: remove tabindex workaround when  is fixed https://github.com/PolymerElements/paper-input/issues/324 -->
            <paper-icon-button slot="suffix" suffix id="clear" icon="clear" on-click="_clear" tabindex="-1"></paper-icon-button>
            <slot name="suffix" slot="suffix"></slot>
          </paper-input>
          <!-- to announce current selection to screen reader -->
          <span id="autocompleteStatus" role="status" class="sr-only">[[_highlightedSuggestion.textValue]]</span>
        </div>

        <paper-autocomplete-suggestions 
          for="autocompleteInput"
          id="paperAutocompleteSuggestions"
          min-length="[[minLength]]"
          text-property="[[textProperty]]"
          value-property="[[valueProperty]]"
          selected-option="{{selectedOption}}"
          source="[[source]]"
          remote-source="[[remoteSource]]"
          query-fn="[[queryFn]]"
          event-namespace="[[eventNamespace]]"
          highlighted-suggestion="{{_highlightedSuggestion}}"
          is-open="{{_isSuggestionsOpened}}"
          highlight-first="[[highlightFirst]]"
          show-results-on-focus="[[showResultsOnFocus]]">

          <slot id="templates" name="autocomplete-custom-template"></slot>

        </paper-autocomplete-suggestions>
    `;
  }

  static get properties() {
    return {
      /**
         * `autoValidate` Set to true to auto-validate the input value.
         */
        autoValidate: {
          type: Boolean,
          value: false
        },
        /**
         * Setter/getter manually invalid input
         */
        invalid : {
          type: Boolean,
          notify: true,
          value: false
        },
        /**
         * `autocapitalize` Sets auto-capitalization for the input element.
         */
        autocapitalize: String,

        /**
         * `errorMessage` The error message to display when the input is invalid.
         */
        errorMessage: {
          type: String
        },

        /**
         * `label` Text to display as the input label
         */
        label: String,

        /**
         * `noLabelFloat` Set to true to disable the floating label.
         */
        noLabelFloat: {
          type: Boolean,
          value: false
        },

        /**
         * `alwaysFloatLabel` Set to true to always float label
         */
        alwaysFloatLabel: {
          type: Boolean,
          value: false
        },

        /**
         * The placeholder text
         */
        placeholder: String,

        /**
         * `required` Set to true to mark the input as required.
         */
        required: {
          type: Boolean,
          value: false
        },

        /**
         * `readonly` Set to true to mark the input as readonly.
         */
        readonly: {
          type: Boolean,
          value: false
        },

        /**
         * `focused` If true, the element currently has focus.
         */
        focused: {
          type: Boolean,
          value: false,
          notify: true
        },

        /**
         * `disabled` Set to true to mark the input as disabled.
         */
        disabled: {
          type: Boolean,
          value: false
        },

        /**
         * `source` Array of objects with the options to execute the autocomplete feature
         */
        source: {
          type: Array,
          observer: '_sourceChanged'
        },

        /**
         * Property of local datasource to as the text property
         */
        textProperty: {
          type: String,
          value: 'text'
        },

        /**
         * Property of local datasource to as the value property
         */
        valueProperty: {
          type: String,
          value: 'value'
        },

        /**
         * `value` Selected object from the suggestions
         */
        value: {
          type: Object,
          notify: true
        },

        /**
         * The current/selected text of the input
         */
        text: {
          type: String,
          notify: true,
          value: ''
        },

        /**
         * Disable showing the clear X button
         */
        disableShowClear: {
          type: Boolean,
          value: false
        },

        /**
         * Binds to a remote data source
         */
        remoteSource: {
          type: Boolean,
          value: false
        },

        /**
         * Event type separator
         */
        eventNamespace: {
          type: String,
          value: '-'
        },

        /**
         * Minimum length to trigger suggestions
         */
        minLength: {
          type: Number,
          value: 1
        },

        /**
         * `pattern` Pattern to validate input field
         */
        pattern: String,

        /**
         * allowedPattern` allowedPattern to validate input field
         */
        allowedPattern: String,

        /**
         * Set to `true` to show a character counter.
         */
        charCounter: {
          type: Boolean,
          value: false
        },

        /**
         * The maximum length of the input value.
         */
        maxlength: {
          type: Number
        },

        /**
         * Name to be used by the autocomplete input. This is necessary if wanted to be integrated with iron-form.
         */
        name: String,

        /**
         used to filter available items. Thiis actually used by paper-autocomplete-suggestions,
         * it is also exposed here so it is possible to provide a custom queryFn.
         */
        queryFn: {
          type: Function
        },

        /**
         * If `true`, it will always highlight the first result each time new suggestions are presented.
         */
         highlightFirst: {
          type: Boolean,
          value: false
        },

        /**
         * Set to `true` to show available suggestions on focus. This overrides the default behavior that only shows
         * notifications after user types
         */
        showResultsOnFocus: {
          type: Boolean,
          value: false
        },

        /*************
        * PRIVATE
        *************/
        // TODO: check if we need _value and _text properties. It seems they can be removed
        _value: {
          value: undefined
        },

        _text: {
          value: undefined
        },

        /**
         * Indicates whether the clear button is visible or not
         */
        _isClearButtonVisible: {
          type: Boolean,
          value: false
        },

        /**
         * Indicates whether the suggestion popup is visible or not.
         */
        _isSuggestionsOpened: {
          type: Boolean,
          value: false
        },

        /**
         * Object containing the information of the currently selected option
         */
        selectedOption: {
          type: Object,
          notify: true
        }
    }
  }

  static get is() {
    return 'paper-autocomplete';
  }

  static get observers() {
    return [
      '_textObserver(text)'
    ];
  }

  sourceChanged(newSource) {
    var text = this.text;
    if (!Array.isArray(newSource) || newSource.length === 0 || text == null || text.length < this.minLength) {
      return;
    }
    if (!this.$.autocompleteInput.focused) {
      return;
    }
    this.$.paperAutocompleteSuggestions._handleSuggestions({
      target: {
        value: text
      }
    });
  }

  // Element Lifecycle
  ready() {
    super.ready();
    this._value = this.value;

    this.addEventListener(
      'autocomplete' + this.eventNamespace + 'selected',
      this._onAutocompleteSelected.bind(this)
    );
  }

  /**
   * Clears the input text
   */
  _clear() {
    var option = {
      text: this.text,
      value: this.value
    };

    this.value = null;
    this._value = null;
    this.text = '';
    this._text = '';

    this._fireEvent(option, 'reset-blur');

    this._hideClearButton();

    // Fix: https://github.com/PolymerElements/paper-input/issues/493
    if (!this.$.autocompleteInput.focused) {
      this.$.autocompleteInput.focus();
    }
  }

  /**
   * Dispatches autocomplete events
   */
  _fireEvent(option, evt) {
    var id = this._getId();
    var event = 'autocomplete' + this.eventNamespace + evt;

    this.fire(event, {
      id: id,
      value: option[this.valueProperty] || option.value,
      text: option[this.textProperty] || option.text,
      target: this,
      option: option
    });
  }

  /**
   * On text event handler
   */
  _textObserver(text) {
    if (text && text.trim()) {
      this._showClearButton();
    } else {
      this._hideClearButton();
    }
  }

  /**
   * On autocomplete selection
   */
  _onAutocompleteSelected(event) {
    var selection = event.detail;

    this.value = selection.value;
    this.text = selection.text;
  }

  /**
   * Show the clear button (X)
   */
  _showClearButton() {
    if (this.disableShowClear) {
      return;
    }

    if (this._isClearButtonVisible) {
      return;
    }

    this.$.clear.style.display = 'inline-block';
    this._isClearButtonVisible = true;
  }

  /**
   * Hide the clear button (X)
   */
  _hideClearButton() {
    if (!this._isClearButtonVisible) {
      return;
    }

    this.$.clear.style.display = 'none';
    this._isClearButtonVisible = false;
  }

  _getId() {
    var id = this.getAttribute('id');
    if (!id) id = this.dataset.id;
    return id;
  }

  /****************************
   * PUBLIC
   ****************************/

  /**
   * Gets the current text/value option of the input
   * @returns {Object}
   */
  getOption() {
    return {
      text: this.text,
      value: this.value
    };
  }

  /**
   * Sets the current text/value option of the input
   * @param {Object} option
   */
  setOption(option) {
    this.text = option[this.textProperty] || option.text;
    this.value = option[this.valueProperty] || option.value;
    this._showClearButton();
  }

  /**
   * Disables the input
   */
  disable() {
    this.disabled = true;
  }

  /**
   * Enables the input
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Sets the component's current suggestions
   * @param {Array} arr
   */
  suggestions(arr) {
    this.$.paperAutocompleteSuggestions.suggestions(arr);
  }

  /**
   * Validates the input
   * @returns {Boolean}
   */
  validate() {
    return this.$.autocompleteInput.validate();
  }

  /**
   * Clears the current input
   */
  clear() {
    this._value = '';
    this._text = '';
    this._clear();
  }

  /**
   * Resets the current input (DEPRECATED: please use clear)
   */
  reset() {
    this._clear();
  }

  /**
   * Hides the suggestions popup
   */
  hideSuggestions() {
    this._hideClearButton();
    this.$.paperAutocompleteSuggestions.hideSuggestions();
  }

  /**
   * Allows calling the onSelecfrom outside
   * This in time triggers the autocomplete-selected event
   * with all the data required
   */
  onSelectHandler(event) {
    this.$.paperAutocompleteSuggestions._onSelect(event);
  }

  /**
   * Fired when a selection is made
   *
   * @event autocomplete-selected
   * @param {String} id
   * @param {String} text
   * @param {Element} target
   * @param {Object} option
   */

  /**
   * Fired on input change
   *
   * @event autocomplete-change
   * @param {String} id
   * @param {String} text
   * @param {Element} target
   * @param {Object} option
   */

  /**
   * Fired on input focus
   *
   * @event autocomplete-focus
   * @param {String} id
   * @param {String} text
   * @param {Element} target
   * @param {Object} option
   */

  /**
   * Fired on input blur
   *
   * @event autocomplete-blur
   * @param {String} id
   * @param {String} text
   * @param {Element} target
   * @param {Object} option
   */

  /**
   * Fired on input reset/clear
   *
   * @event autocomplete-reset-blur
   * @param {String} id
   * @param {String} text
   * @param {Element} target
   * @param {Object} option
   */
}

customElements.define(PaperAutocomplete.is, PaperAutocomplete);
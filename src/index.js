import _get from 'lodash.get'
import _forEach from 'lodash.foreach'
import _remove from 'lodash.remove'

const Validatable = {
  props: {
    validate: {
      type: Array
    },
    validatePath: {
      type: String,
      default: 'value'
    }
  },
  data() {
    return {
      container: null,
      validateResult: {
        valid: true,
        message: ''
      }
    }
  },
  created() {
    if(!this.validate || this.validate.length === 0) return;
    this.$watch(this.validatePath, (newVal, oldVal) => this.validateResult = {valid: true})

    let container = this
    while(!container.isValidationContainer && container.$parent) {
      // console.log('this:', this.$options.name, 'current container: ', container.$options.name)
      container = container.$parent
    }
    if(container.isValidationContainer) {
      this.container = container
    } else {
      console.error('No validation container found in ancestors. There must be one.')
      return
    }
    this.$on('validate', (resolve, reject) => {
      let toBeValidate = _get(this, this.validatePath)
      let firstInvalidValidator = this.validate.find(validator => validator.pred(toBeValidate));
      if (firstInvalidValidator) {
        this.validateResult = {
          valid: false,
          message: firstInvalidValidator.message
        };
      } else {
        this.validateResult = {valid: true};
      }
      this.container.$emit('validate-result', this.validateResult, resolve, reject);
    })

    this.container.$emit('register-validation', this)
  },
  beforeDestroy(){
    this.container && this.container.$emit('unregister-validation', this)
  }
};

const ValidationContainer = {
  methods: {
    $doValidate() {
      this.validated = 0;
      return new Promise((resolve, reject) => {
        _forEach(this.validatables, validatable => validatable.$emit('validate', resolve, reject));
      });
    }
  },
  data() {
    return {
      isValidationContainer: true,
      validatables: [],
      validationCount: 0,
      validated: 0
    }
  },
  created() {
    this.$on('register-validation', (validatable) => {
      this.validatables.push(validatable)
      this.validationCount += 1
    }).$on('unregister-validation', (validatable) => {
      _remove(this.validatables, validatable)
      this.validationCount -= 1
    }).$on('validate-result', (result, resolve, reject) => {
      if (!result.valid) {
        reject(result.message);
      } else {
        this.validated += 1;
        if (this.validated === this.validationCount) {
          resolve();
        }
      }
    })
  }
};

const DefaultValidators = {
  methods: {
    $require(message) {
      return {
        pred: val => {
          return val === null || val.length === 0
        },
        message: message || '必填项'
      };
    },
    $max(max, message) {
      return {
        pred: val => val > max,
        message: message || `不能大于 ${ max }`
      };
    },
    $min(min, message) {
      return {
        pred: val => val < min,
        message: message || `不能小于 ${ min }`
      };
    },
    $range(min, max, message) {
      return {
        pred: val => val < min || val > max,
        message: message || `必须在 ${ min } 到 ${ max } 之间`
      };
    },
    $minLength(min, message) {
      return {
        pred: val => val.length < min,
        message: message || `长度不能小于 ${ min }`
      };
    },
    $equalTo(exp, message) {
      return {
        pred: val => val !== _get(this, exp),
        message: message || `必须与 ${exp} 相同`
      }
    }
  }
};

export {Validatable, ValidationContainer, DefaultValidators};
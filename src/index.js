const Validatable = {
  props: {
    validate: {
      type: Array
    },
    validatePath: {
      type: String,
      default: 'model'
    },
    eventBus: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      validateResult: {
        valid: true,
        message: ''
      }
    }
  },
  created() {
    this.$watch(this.validatePath, (newVal, oldVal) => this.validateResult = {valid: true})
    this.eventBus.$on('validate', (resolve, reject) => {
      let toBeValidate = this[this.validatePath]
      let firstInvalidValidator = this.validate.find(validator => validator.pred(toBeValidate));
      if (firstInvalidValidator) {
        this.validateResult = {
          valid: false,
          message: firstInvalidValidator.message
        };
      } else {
        this.validateResult = {valid: true};
      }
      this.eventBus.$emit('validate-result', this.validateResult, resolve, reject);
    })
    this.eventBus.$emit('register-validation')
  },
  beforeDestroy(){
    this.eventBus.$emit('unregister-validation')
  }
};

const ValidationContainer = {
  methods: {
    $doValidate() {
      this.validated = 0;
      return new Promise((resolve, reject) => {
        this.eventBus.$emit('validate', resolve, reject);
      });
    }
  },
  props: {
    eventBus: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      validationCount: 0,
      validated: 0
    }
  },
  created() {
    this.eventBus.$on('register-validation', () => {
      this.validationCount += 1;
    }).$on('unregister-validation', () => {
      this.validationCount -= 1;
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
        pred: val => val === null || val.length === 0,
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
        pred: val => { console.log('val=', val,  ',exp=', exp, ',this=', this, ',this["form_data.new_password"]', this['form_data.new_password']); val !== this[exp]},
        message: message || `必须与 ${exp} 相同`
      }
    }
  }
};

export {Validatable, ValidationContainer, DefaultValidators};
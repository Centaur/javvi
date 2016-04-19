let Validatable = {
  props: {
    validate: {
      type: Array
    },
    validatePath: {
      type: String,
      default: 'model'
    }
  },
  data() {
    return {
      validateResult: {
        valid: true,
        message: ''
      }
    };
  },
  events: {
    validate(resolve, reject) {
      let toBeValidate = this.$get(this.validatePath)
      let firstInvalidValidator = this.validate.find(validator => validator.pred(toBeValidate));
      if (firstInvalidValidator) {
        this.validateResult = {
          valid: false,
          message: firstInvalidValidator.message
        };
      } else {
        this.validateResult = {valid: true};
      }
      this.$dispatch('validate-result', this.validateResult, resolve, reject);
    }
  },
  created() {
    this.$watch(this.validatePath, (newVal, oldVal) => this.validateResult = {valid: true})
    this.$dispatch('register-validation');
  },
  beforeDestroy(){
    this.$dispatch('unregister-validation')
  }
};

let ValidationContainer = {
  methods: {
    $doValidate() {
      this.validated = 0;
      return new Promise((resolve, reject) => {
        this.$broadcast('validate', resolve, reject);
      });
    }
  },
  data() {
    return {
      validationCount: 0,
      validated: 0
    };
  },
  events: {
    'register-validation': function () {
      this.validationCount += 1;
    },
    'unregister-validation': function () {
      this.validationCount -= 1;
    },
    'validate-result': function (result, resolve, reject) {
      if (!result.valid) {
        reject(result.message);
      } else {
        this.validated += 1;
        if (this.validated === this.validationCount) {
          resolve();
        }
      }
    }
  }
};

let DefaultValidators = {
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
        pred: val => val !== this.$eval(exp),
        message: message || `必须与 ${exp} 相同`
      }
    }
  }
};

export {Validatable, ValidationContainer, DefaultValidators};
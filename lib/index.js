'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Validatable = {
  props: {
    validate: {
      type: Array
    },
    validatePath: {
      type: String,
      default: 'model'
    }
  },
  data: function data() {
    return {
      validateResult: {
        valid: true,
        message: ''
      }
    };
  },

  events: {
    validate: function validate(resolve, reject) {
      var toBeValidate = this.$get(this.validatePath);
      var firstInvalidValidator = this.validate.find(function (validator) {
        return validator.pred(toBeValidate);
      });
      if (firstInvalidValidator) {
        this.validateResult = {
          valid: false,
          message: firstInvalidValidator.message
        };
      } else {
        this.validateResult = { valid: true };
      }
      this.$dispatch('validate-result', this.validateResult, resolve, reject);
    }
  },
  created: function created() {
    var _this = this;

    this.$watch(this.validatePath, function (newVal, oldVal) {
      return _this.validateResult = { valid: true };
    });
    this.$dispatch('register-validation');
  },
  beforeDestroy: function beforeDestroy() {
    this.$dispatch('unregister-validation');
  }
};

var ValidationContainer = {
  methods: {
    $doValidate: function $doValidate() {
      var _this2 = this;

      this.validated = 0;
      return new Promise(function (resolve, reject) {
        _this2.$broadcast('validate', resolve, reject);
      });
    }
  },
  data: function data() {
    return {
      validationCount: 0,
      validated: 0
    };
  },

  events: {
    'register-validation': function registerValidation() {
      this.validationCount += 1;
    },
    'unregister-validation': function unregisterValidation() {
      this.validationCount -= 1;
    },
    'validate-result': function validateResult(result, resolve, reject) {
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

var DefaultValidators = {
  methods: {
    $require: function $require(message) {
      return {
        pred: function pred(val) {
          return val === null || val.length === 0;
        },
        message: message || '必填项'
      };
    },
    $max: function $max(max, message) {
      return {
        pred: function pred(val) {
          return val > max;
        },
        message: message || '不能大于 ' + max
      };
    },
    $min: function $min(min, message) {
      return {
        pred: function pred(val) {
          return val < min;
        },
        message: message || '不能小于 ' + min
      };
    },
    $range: function $range(min, max, message) {
      return {
        pred: function pred(val) {
          return val < min || val > max;
        },
        message: message || '必须在 ' + min + ' 到 ' + max + ' 之间'
      };
    },
    $minLength: function $minLength(min, message) {
      return {
        pred: function pred(val) {
          return val.length < min;
        },
        message: message || '长度不能小于 ' + min
      };
    },
    $equalTo: function $equalTo(exp, message) {
      var _this3 = this;

      return {
        pred: function pred(val) {
          return val !== _this3.$eval(exp);
        },
        message: message || '必须与 ' + exp + ' 相同'
      };
    }
  }
};

exports.Validatable = Validatable;
exports.ValidationContainer = ValidationContainer;
exports.DefaultValidators = DefaultValidators;
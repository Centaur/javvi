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
    },
    eventBus: {
      type: Object,
      required: true
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
  created: function created() {
    var _this = this;

    this.$watch(this.validatePath, function (newVal, oldVal) {
      return _this.validateResult = { valid: true };
    });
    this.eventBus.$on('validate', function (resolve, reject) {
      var toBeValidate = _this[_this.validatePath];
      var firstInvalidValidator = _this.validate.find(function (validator) {
        return validator.pred(toBeValidate);
      });
      if (firstInvalidValidator) {
        _this.validateResult = {
          valid: false,
          message: firstInvalidValidator.message
        };
      } else {
        _this.validateResult = { valid: true };
      }
      _this.eventBus.$emit('validate-result', _this.validateResult, resolve, reject);
    });
    this.eventBus.$emit('register-validation');
  },
  beforeDestroy: function beforeDestroy() {
    this.eventBus.$emit('unregister-validation');
  }
};

var ValidationContainer = {
  methods: {
    $doValidate: function $doValidate() {
      var _this2 = this;

      this.validated = 0;
      return new Promise(function (resolve, reject) {
        _this2.eventBus.$emit('validate', resolve, reject);
      });
    }
  },
  props: {
    eventBus: {
      type: Object,
      required: true
    }
  },
  data: function data() {
    return {
      validationCount: 0,
      validated: 0
    };
  },
  created: function created() {
    var _this3 = this;

    this.eventBus.$on('register-validation', function () {
      _this3.validationCount += 1;
    }).$on('unregister-validation', function () {
      _this3.validationCount -= 1;
    }).$on('validate-result', function (result, resolve, reject) {
      if (!result.valid) {
        reject(result.message);
      } else {
        _this3.validated += 1;
        if (_this3.validated === _this3.validationCount) {
          resolve();
        }
      }
    });
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
      var _this4 = this;

      return {
        pred: function pred(val) {
          console.log('val=', val, ',exp=', exp, ',this=', _this4, ',this["form_data.new_password"]', _this4['form_data.new_password']);val !== _this4[exp];
        },
        message: message || '必须与 ' + exp + ' 相同'
      };
    }
  }
};

exports.Validatable = Validatable;
exports.ValidationContainer = ValidationContainer;
exports.DefaultValidators = DefaultValidators;
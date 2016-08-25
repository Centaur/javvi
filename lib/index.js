'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultValidators = exports.ValidationContainer = exports.Validatable = undefined;

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _remove2 = require('lodash/remove');

var _remove3 = _interopRequireDefault(_remove2);

var _bind2 = require('lodash/bind');

var _bind3 = _interopRequireDefault(_bind2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Validatable = {
  props: {
    validate: {
      type: Array
    },
    validatePath: {
      type: String,
      default: 'value'
    }
  },
  data: function data() {
    return {
      container: null,
      validateResult: {
        valid: true,
        message: ''
      }
    };
  },
  validates: function validates() {
    return this.validate;
  },
  created: function created() {
    var _this = this;

    if (!this.validate || this.validate.length === 0) return;
    this.$watch(this.validatePath, function (newVal, oldVal) {
      _this.validateResult = { valid: true };
    });

    var container = this;
    while (!container.isValidationContainer && container.$parent) {
      container = container.$parent;
    }
    if (container.isValidationContainer) {
      this.container = container;
    } else {
      console.error('No validation container found in ancestors. There must be one.');
      return;
    }
    this.$on('validate', function (resolve, reject) {
      var toBeValidate = (0, _get3.default)(_this, _this.validatePath);
      var validates = (0, _bind3.default)(_this.$options.validates, _this);
      var firstInvalidValidator = validates().find(function (validator) {
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
      _this.container.$emit('validate-result', _this.validateResult, resolve, reject);
    });

    this.container.$emit('register-validation', this);
  },
  beforeDestroy: function beforeDestroy() {
    this.container && this.container.$emit('unregister-validation', this);
  }
};

var ValidationContainer = {
  methods: {
    $doValidate: function $doValidate() {
      var _this2 = this;

      this.validated = 0;
      return new Promise(function (resolve, reject) {
        (0, _forEach3.default)(_this2.validatables, function (validatable) {
          return validatable.$emit('validate', resolve, reject);
        });
      });
    }
  },
  data: function data() {
    return {
      isValidationContainer: true,
      validatables: [],
      validationCount: 0,
      validated: 0
    };
  },
  created: function created() {
    var _this3 = this;

    this.$on('register-validation', function (validatable) {
      _this3.validatables.push(validatable);
      _this3.validationCount += 1;
    }).$on('unregister-validation', function (validatable) {
      (0, _remove3.default)(_this3.validatables, validatable);
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
          return val === null || typeof val === 'string' && val.length === 0;
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
          return val !== (0, _get3.default)(_this4, exp);
        },
        message: message || '必须与 ' + exp + ' 相同'
      };
    }
  }
};

exports.Validatable = Validatable;
exports.ValidationContainer = ValidationContainer;
exports.DefaultValidators = DefaultValidators;
# javvi
Just Another Vue Validation Idea

## Install

`npm install --save javvi`

## Introduction

It is flexible, unobtrusive, lightweight. No need for a `form`, no need for submit buttons, no scoping tag.

It is as simple as just 3 mixins:

1. **`Validatable`** used on components that display the error messages

    Just give validatable an array of validators.
    Validators are objects that contains:
    ```js
    {
      pred: 'A function that applies to model value and return boolean value',
      message: 'The error message when validation fails'
    }
    ```
    So you can define custom validators with little effort.
    Note that the `pred` function should return `true` on invalid model value;

1. **`ValidationContainer`** used on the component that triggers the validation

    Call `this.$doValidate` whenever to trigger validation, it will return a `Promise`. If all validatables pass, this promise will be resolved, otherwise rejected.

1. **`DefaultValidators`** are just some frequently used validators.

Here is the [example](http://www.webpackbin.com/41dHzpMJb)

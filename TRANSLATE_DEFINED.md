### 1. For email:
 - Create templates for all languages support
 - Define template ID with the suffix is the language code.
 Example, if we have 2 languages: vi, en.
 Define 2 templateID: FORGOT_PASSWORD_TEMPLATE_ID_EN, FORGOT_PASSWORD_TEMPLATE_ID_VI
 - When call the function send mail, let pass the language code too.
 ````javascript
try {
  await sendEmail(
    SENDER_EMAIL,
    user.email,
    VERIFY_EMAIL_TEMPLATE_ID,
    {
      subject: VERIFY_EMAIL_SUBJECT,
      verificationCode: verifyCode,
      userFullName: user.fullName,
    },
    user.language
  );
} catch (error) {
  logger.error('User login sendEmail error:', error);
  return Promise.reject(new APIError(500, 'Internal server error'));
}
````
### 2. For express validation (status code 422):
 - In the validator file, if have the params, let define the message is an array contains 2 items:
 ````javascript
  body('password').isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s chars long',
    [USER_MIN_PASSWORD_LENGTH]
  ])
 ````
 The first item is the message template, the second item is the value pass to the params in the template
 
 ### 3. Define language in locales:
  Open the locales file and define your text
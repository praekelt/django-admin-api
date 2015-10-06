jest.dontMock('../login-container.js');
describe('Logincontainer', function() {
    var React = require('react/addons');
    var Cookies = require('js-cookie');
    var TestUtils = React.addons.TestUtils;
    var LoginContainer = require('../login-container.js');
    var LoginForm = require('../login-container.js');
    var container, form;

    beforeEach(function() {
        document.body.innerHTML = '<div id="login" />';
        container = TestUtils.renderIntoDocument(
            <LoginContainer/>
        );
        form = TestUtils.findRenderedComponentWithType(container, LoginForm);
    });

    it('Test that the actual view exists', function() {
        // Render into document
        expect(React.findDOMNode(container)).toBeTruthy();
        expect(React.findDOMNode(form)).toBeTruthy();
    });

    // Test container fields
    it('Test container elements exist', function() {
        var contents = TestUtils.findRenderedDOMComponentWithClass(container, 'login-form');

        var fields = TestUtils.scryRenderedDOMComponentsWithTag(container, 'input');
        expect(React.findDOMNode(contents)).toBeTruthy();
        expect(fields.length).toEqual(3);
    });

    it('Test form input fields default value', function() {
        var usernameField = React.findDOMNode(form.refs.username);
        var passwordField = React.findDOMNode(form.refs.password);

        // Test if fields are empty by default
        expect(React.findDOMNode(usernameField).value).toEqual('');
        expect(React.findDOMNode(passwordField).value).toEqual('');
   });

    it('Test changed DOM value of text fields', function() {
        var usernameField = React.findDOMNode(form.refs.username);
        var passwordField = React.findDOMNode(form.refs.password);

       // Test the correct value is pulled from the DOM
        usernameField.value = 'test';
        passwordField.value = 'testp4ss';

        expect(React.findDOMNode(usernameField).value.trim()).toEqual('test');
        expect(React.findDOMNode(passwordField).value.trim()).toEqual('testp4ss');
    });

    it('Test ensure onSubmit is called', function() {
        form.onSubmit = jest.genMockFunction();
        var usernameField = React.findDOMNode(form.refs.username);
        var passwordField = React.findDOMNode(form.refs.password);
        // Test the correct value is pulled from the DOM

        TestUtils.Simulate.change(usernameField, {target: {value: 'test'}});
        TestUtils.Simulate.change(passwordField, {target: {value: 'testp4ss'}});
        TestUtils.Simulate.submit(form);
		expect(form.onSubmit).toBeCalled();
    });
});

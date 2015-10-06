jest.dontMock('../login.js');

describe('LoginContainer', function() {
    var React = require('react/addons');
    var TestUtils = React.addons.TestUtils;
    var LoginContainer = require('../login.js');
    var container;

    beforeEach(function() {
        document.body.innerHTML = '<div id="login"><div>';
		var div = document.createElement('div').setAttributes(id='login');
		document.body.appendChild(div);
        container = TestUtils.renderIntoDocument(
            <LoginContainer/>
        );
    });

    it('Test that the actual view exists', function() {
        // Render into document
        expect(React.findDOMNode(container)).toBeTruthy();
    });
});

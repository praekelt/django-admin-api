// Acquire csrf token and set token header for all subsequent ajax calls
//TODO move this out to custom.js
var csrftoken = Cookies.get('csrftoken');
$(function () {
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});
console.log(csrftoken);
var LoginContainer = React.createClass({displayName: 'ReactLogin',
    handleLoginSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
               this.setState({infoMessage: ''});
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Login success')
                this.setState({infoMessage: 'Success token: ' + data.token});
                console.log('state set');
                Cookies.set('token', data, {expires: 1}, {secure: true});
                console.log('Cookie data set');
                // Make a GET request to a view that requires auth token header
                this.testAuthToken(data);
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({infoMessage: jsonError.detail});
            }.bind(this)
        });
    },
    // Test the received auth token
    // Makes a GET call to djangoREST api view, that requires jsw token validation
    testAuthToken: function(data) {
        $.ajax({
            url: '/test/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
                this.setState({infoMessage: ''});
            }.bind(this),
            cache: false,
            success: function(data) {
                this.setState({infoMessage: 'Success: ' + data.detail});
                window.location = '/app/form/';
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({infoMessage: jsonError.detail});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {infoMessage: ''};
    },
    render: function() {
        return (
            <div className="login-container" >
                <LoginForm onLoginSubmit={ this.handleLoginSubmit } />
                <p id="info-block">{ this.state.infoMessage }</p>
            </div>
        );
    }
});

var LoginForm = React.createClass({displayName: 'LoginForm',
    handleSubmit: function(e) {
        e.preventDefault();
        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();
        // Final catch if HTML5 validation fails
        if (!password || !username) {
            alert('Please fill in both username and password fields');
            return;
        }
        this.props.onLoginSubmit({username: username, password: password});
        React.findDOMNode(this.refs.username).value = '';
        React.findDOMNode(this.refs.password).value = '';
    },
    render: function() {
        return (
            <form className="login-form" onSubmit={ this.handleSubmit } >
                <input type="text" placeholder="Username" ref="username" required/>
                <input type="password" placeholder="Password" ref="password" required/>
                <input type="submit" value="Post" />
            </form>
        );
    }
});

module.exports = LoginContainer;
module.exports = LoginForm;

// Acquire csrf token and set token header for all subsequent ajax calls
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
        console.log(csrftoken);
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Login success')
                console.log('state set');
                Cookies.set('token', data, {expires: 1}, {secure: true});
                console.log('Cookie data set');
                window.location = '/users/app/';
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div className="loginContainer" >
                <LoginForm onLoginSubmit={ this.handleLoginSubmit } />
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
                <input type="submit" value="Log in" />
            </form>
        );
    }
});

React.render(
    React.createElement(LoginContainer,{url: '/login/'}),
    document.getElementById('login')
);


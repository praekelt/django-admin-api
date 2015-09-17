var LoginContainer = React.createClass({displayName: 'ReactLogin',
    handleLoginSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
               this.setState({errorMessage: ''});
            }.bind(this),
            cache: false,
            success: function(data) {
                this.setState({errorMessage: 'Success token: ' + data.token});
                this.transitionTo('/test-view/');
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({errorMessage: jsonError.detail});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {errorMessage: ''};
    },
    render: function() {
        return (
            <div className="login-container" >
                <LoginForm onLoginSubmit={ this.handleLoginSubmit } />
                <p id="error-block">{ this.state.errorMessage }</p>
            </div>
        );
    }
});

var LoginForm = React.createClass({displayName: 'LoginForm',
    handleSubmit: function(e) {
        e.preventDefault();
        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();
        // TODO form validation
        if (!password || !username) {
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

React.render(
    React.createElement(LoginContainer,{url: '/login-auth/'}),
    document.getElementById('login-div')
);


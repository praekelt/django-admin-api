var LoginContainer = React.createClass({displayName: 'ReactLogin',
    handleLoginSubmit: function(username, password) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: '{username: ' + username +', password: ' + password +' }',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', (username + ':' + password));
            },
            cache: false,
            success: function(data) {
                console.log(data.token)
                // TODO Print reply
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    render: function() {
        return (
            <div className="login-container" >
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
                <input type="text" placeholder="Username" ref="username" />
                <input type="text" placeholder="Password" ref="password" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

React.render(
    React.createElement(LoginContainer,{url: '/login-auth/'}),
    document.getElementById('login-div')
);


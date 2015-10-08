function errorCompiler(data) {
    var errorString = '';
    if(data.username) {
        errorString += '\n Username: ' + data.username;
    }
    if(data.password){
        errorString += '\n Password: ' + data.password;
    }
    if(data.first_name){
        errorString += '\n First name: ' + data.first_name;
    }
    if(data.last_name){
        errorString += '\n Last name: ' + data.last_name;
    }
    if(data.email){
        errorString += '\n Email: ' + data.email;
    }
    return errorString;
}
var FormContainer = React.createClass({displayName: 'ReactForm',
    retrieveData: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Retrieval success')
                this.setState({dataList: data});
                console.log('state set');
            }.bind(this),
            error: function(xhr, status, err) {
                if(xhr.status == 403) {
                    window.location.replace('/permission-denied/')
                }
            }.bind(this)
        });
    },
    handleSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: data,
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Submit success')
                alert('Successfully submitted');
            }.bind(this),
            error: function(xhr, status, err) {
                console.warn(xhr.responseText);
                jsonError = JSON.parse(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleUpdate: function(data) {
        $.ajax({
            url: this.props.url + data.id + '/',
            dataType: 'json',
            type: 'PUT',
            data: data,
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Update success');
                alert('Successfully updated');
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.warn(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        console.log(Cookies.getJSON('token').token);
        $.ajax({
            url: this.props.url + data.id + '/',
            datatype: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                alert('Successfully deleted');
                console.log('Delete success');
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr.responseText);
            }.bind(this)
        });
    },
    handleCancel: function() {
        this.setState({formData: {}});
    },
    selectListItem: function(data) {
        this.setState({formData: data});
    },
    getInitialState: function() {
        return {data: null, formData: {}, dataList: []};
    },
    componentDidMount: function() {
        this.retrieveData();
    },
    render: function() {
        return (
            <div className="form-container" >
                <Form
                    data={this.state.formData}
                    onSubmit={this.handleSubmit}
                    onUpdate={this.handleUpdate}
                    onDelete={this.handleDelete}
                    handleCancel={this.handleCancel}
                />
                <ModelList
                    data={this.state.dataList}
                    handleItemSelect={this.selectListItem}
                />
            </div>
        );
    }
});

var ModelList = React.createClass({displayName: 'ModelList',
    handleClick: function(model){
        console.log('ModelList: handleClick');
        this.props.handleItemSelect(model);
    },

    render: function() {
        var listItems = this.props.data.map(function (model) {
            return (
                <Model
                    key={model.id}
                    data={model}
                    handleClick={this.handleClick.bind(this, model)}
                />
            );
        }.bind(this));
        return(
            <ul id="list">
                {listItems}
            </ul>
        );
    }
});

var Model = React.createClass({displayName: 'Model',
    handleClick: function(e){
        console.log('Model: handleClick');
        e.preventDefault();
        this.props.handleClick(this.props.data);
    },

    render: function() {
        return (
            <li id={"item-"+this.props.data.id}>
                <a onClick={this.handleClick} >
                    {this.props.data.username}
                </a>
            </li>
        );
    }
});

var Form = React.createClass({displayName: 'Form',
    mixins: [React.addons.LinkedStateMixin],
    handleSubmit: function(e) {
        e.preventDefault();
        var username = ReactDOM.findDOMNode(this.refs.username).value.trim();
        var password = ReactDOM.findDOMNode(this.refs.password).value.trim();
        var first_name = ReactDOM.findDOMNode(this.refs.first_name).value.trim();
        var last_name = ReactDOM.findDOMNode(this.refs.last_name).value.trim();
        var email = ReactDOM.findDOMNode(this.refs.email).value.trim();
        // Final catch if HTML5 validation fails
        if(!username) {
            alert('Please fill in the field');
            return;
        }
        if(this.props.data.id == null) {
            /*
            if(!password) {
                alert('Please provide password for new user');
                return;
            }
            */
            this.props.onSubmit({
                username: username,
                password: password,
                first_name: first_name,
                last_name: last_name,
                email: email
            });
        } else {
            if(!password) {
                this.props.onUpdate({
                    id: this.props.data.id,
                    username: username,
                    first_name: first_name,
                    last_name: last_name,
                    email: email
                });
            } else{
                /*
                if(password.length < 6) {
                    alert('Password minimum length should be 6 characters');
                    return;
                }
                */
                this.props.onUpdate({
                    id: this.props.data.id,
                    username: username,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    email: email
                });
            }
        }
        ReactDOM.findDOMNode(this.refs.password).value = '';
    },
    handleDelete: function() {
        if(this.props.data.id != null) {
            if(confirm('Are you sure you want to delete this item?')){
                this.props.onDelete({id: this.props.data.id});
            }
        } else {
            alert('Please select a item to delete')
        }
    },
    handleCancel: function() {
        this.setState({value: ''});
        this.props.handleCancel();
    },
    getInitialState: function() {
        return {value: ''};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            username: nextProps.data.username,
            password: '',
            first_name: nextProps.data.first_name,
            last_name: nextProps.data.last_name,
            email: nextProps.data.email
        });
    },
    render: function() {
        return (
            <form
                className="commentForm"
                onSubmit={this.handleSubmit}
            >
                <input
                    type="text"
                    valueLink={this.linkState('username')}
                    placeholder="Add username"
                    ref="username"
                    maxLength="32"
                    required
                />
                <input
                    type="password"
                    valueLink={this.linkState('password')}
                    placeholder="Add password"
                    ref="password"
                />
                <input
                    type="text"
                    valueLink={this.linkState('first_name')}
                    placeholder="Add first name"
                    ref="first_name"
                    maxLength="100"
                />
                <input
                    type="text"
                    valueLink={this.linkState('last_name')}
                    placeholder="Add first name"
                    ref="last_name"
                    maxLength="100"
                />
                <input
                    type="email"
                    valueLink={this.linkState('email')}
                    placeholder="Add email address"
                    ref="email"
                    maxLength="100"
                />
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

ReactDOM.render(
    React.createElement(FormContainer,{url: '/users/'}),
    document.getElementById('users')
);

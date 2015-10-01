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
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
            }.bind(this)
        });
    },
    handleSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Submit success')
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
            }.bind(this)
        });
    },
    handledelete: function(data) {
        $.ajax({
            url: this.props.url,
            datatype: 'json',
            type: 'delete',
            beforesend: function (xhr) {
               xhr.setrequestheader('authorization', 'basic ' + btoa(data.username + ':' + data.password));
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('submit success')
            }.bind(this),
            error: function(xhr, status, err) {
                jsonerror = json.parse(xhr.responsetext);
                console.error(this.props.url, status, err.tostring(), ' reason: ' + jsonerror.detail);
            }.bind(this)
        });
    },
    handleUpdate: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'PUT',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Submit success')
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
            }.bind(this)
        });
    },
    selectListItem: function(data) {
        this.setState({formData: data});
    },
    getInitialState: function() {
        return {data: null};
    },
    componentDidMount: function() {
        this.retrieveData();
    },
    render: function() {
        return (
            <div className="edit-container" >
                <Form data={ this.state.formData } onSubmit={ this.handleSubmit } />
                <ModelList id="list" data={ this.state.dataList }/>
            </div>
        );
    }
});

var ModelList = React.createClass({
    handleClick: function(tab){
    },

    render: function() {
        return(
            <ul>
                {this.props.data.map( function(model) {
                    return (
                        <Model
                            handleClick={ this.handleClick.bind(this, model) }
                        />
                    );
                }.bind(this))}
            </ul>
        );
    }
});

var Model = React.createClass({
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick();
    },

    render: function() {
        return (
            <li>
                <a onClick={this.handleClick} >
                    {this.props.title}
                </a>
            </li>
        );
    }
});

var Form = React.createClass({

});

React.render(
    React.createElement(FormContainer,{url: '/generic/'}),
    document.getElementById('form')
);

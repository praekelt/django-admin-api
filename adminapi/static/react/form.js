// test_editable_field is a field on a test model in the adminapi.tests directory
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
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
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
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
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
                jsonerror = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' reason: ' + jsonerror.detail);
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
                    {this.props.data.test_editable_field}
                </a>
            </li>
        );
    }
});

var Form = React.createClass({displayName: 'Form',
    handleSubmit: function(e) {
        e.preventDefault();
        var title = React.findDOMNode(this.refs.title).value.trim();
        // Final catch if HTML5 validation fails
        if(!title) {
            alert('Please fill in the field');
            return;
        }
        // test_editable_field is a 32 length field in tests.models.TestModel
        if(this.props.data.id == null) {
            this.props.onSubmit({test_editable_field: title});
        } else {
            this.props.onUpdate({test_editable_field: title, id: this.props.data.id});
        }
        React.findDOMNode(this.refs.title).value = '';
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
        this.setState({value: nextProps.data.test_editable_field});
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    value={this.state.value}
                    onChange={this.handleChange}
                    placeholder="Add a title"
                    ref="title"
                    maxLength="32"
                    required/>
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

React.render(
    React.createElement(FormContainer,{url: '/generic/'}),
    document.getElementById('form')
);

/**
 * Data object coming up needs to contain model and app as well as a FormData object containing form data
 * object{ model='user', app='auth', data{normal data to use}}
 *
 * Ajax calls to be made in the top most container
**/
var AdminContainer = React.createClass({displayName: 'admin-container',
    // model_name and app-label should later reflect any app/model combination to build a form for
    getInitialState: function() {
        return({
            model_name: 'post',
            app_label: 'post',
            listData: [],
            formData: {},
            modelData: [],
            error: ''
        });
    },
    handleListState: function(data) {
        // Supply list element with data
        this.setState({listData: data['data']});
    },
    handleSelect: function(data) {
        // Pass selected list element data to form
        this.setState({formData: data['data']});
    },
    // Make a GET request to model Type of choice and receive list of all objects
    retrieveData: function(data) {
        var url = new String();
        var schema = new String();
        var request = data['request'];
        // Picks url conf based on whether form or list requested data
        if(request == 'list') {
            url = this.props.url
        }else{
            url = '/adminapi/api/v1/';
            schema = 'schema/'
        }
        $.ajax({
            url: url + this.state.app_label + '/' + this.state.model_name + '/' + schema ,
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                if(request == 'list') {
                    this.handleListState({data});
                    console.log('List Updated');
                } else {
                    console.log('Model data updated');
                    this.setState({modelData: data});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr.responseText});
                if(xhr.status == 403) {
                    window.location.replace('adminapi/permission-denied/')
                }
            }.bind(this)
        });
    },
    handleSubmit: function(data) {
        $.ajax({
            url: this.props.url + this.state.app_label + '/' + this.state.model_name + '/',
            dataType: 'json',
            type: 'POST',
            contentType: false,
            processData: false,
            data: data['formData'],
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Creation of ' + this.state.model_name + ' data successful');
                this.retrieveData({request: 'list'});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(xhr);
                this.setState({error: xhr.responseText});
            }.bind(this)
        });
    },
    handleUpdate: function(data) {
        $.ajax({
            url: this.props.url + this.state.app_label + '/' + this.state.model_name + '/' + data['id'] + '/',
            dataType: 'json',
            type: 'PUT',
            contentType: false,
            processData: false,
            data: data['formData'],
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.info('Update of ' + this.state.model_name + ' data successful');
                this.retrieveData({request: 'list'});
                // Re update form data, to keep form from reverting to previous selected data
                this.handleSelect({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr.responseText});
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        var model = data['model'];
        var app = data['app'];
        $.ajax({
            url: this.props.url + this.state.app_label + '/' + this.state.model_name + '/' + data['id'] + '/',
            dataType: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.info('Deletion of ' + this.state.model_name + ' data successful');
                this.retrieveData({request: 'list'});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr.responseText});
            }.bind(this)
        });
    },
    handleCancel: function() {
    this.setState({formData: {}});
    },
    render: function() {
        return (
            <div>
                {this.state.error}
                <Form
                    data={this.state.formData}
                    getModel={this.retrieveData}
                    modelData={this.state.modelData}
                    handleSubmit={this.handleSubmit}
                    handleUpdate={this.handleUpdate}
                    handleDelete={this.handleDelete}
                    handleCancel={this.handleCancel}
                />
                <List
                    data={this.state.listData}
                    getList={this.retrieveData}
                    handleSelect={this.handleSelect}
                />
            </div>
        );
    }
});

var Form = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {form: React.DOM.div(null, "empty"), formData: {}};
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var form = ReactDOM.findDOMNode(this.refs.form);
        var formData = new FormData(form);
        if(!this.props.data.id) {
        console.log('Create');
        this.props.handleSubmit(
            {formData: formData}
        );
        } else {
        console.log('Update');
        this.props.handleUpdate(
            {id: this.props.data.id, formData: formData}
        );
        }
    },
    handleDelete: function(e) {
        e.preventDefault();
        console.log('Delete');
        this.props.handleDelete(
            {id: this.props.data.id}
        );
    },
    handleCancel: function(e) {
        e.preventDefault();
        /**
         * Use jQuery to clear form fields
         * and request empty form data to ensure new item will be created on submit
        **/
        $('#form').find('input:text, input:password, input:file, select, textarea, input[type=datetime]').val('');
        $('#form').find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
        this.props.handleCancel();
    },
    componentWillReceiveProps: function(nextProps) {
        console.log('Props incoming');
        /**
         * Updates pre fill form fields with new incoming values
        **/
        for (field in nextProps.data) {
            if(field == 'image') {
                continue;
            }
            if($('[name='+field+']').is(':checkbox')) {
                $('[name='+field+']').prop( 'checked', nextProps.data[field]);
            } else {
                $('[name='+field+']').val(nextProps.data[field]);
            }
        }
    },
    componentDidUpdate: function(prevProps, prevState) {
        console.log('Update done');
        if(this.props.modelData != prevProps.modelData || prevProps.modelData.length == 0) {
            console.log('Did update and modelDatas do not match');
            //Initial form creation.
            this.setState({form: formBuilder.assemble(this, this.props.modelData)});
        }
    },
    componentDidMount: function() {
        /**
         * Use ajax function to hit the api and obtain model data to build form from
        **/
        console.log('Mounted');
        this.props.getModel({request: 'form'});
    },
    render: function() {
        return React.DOM.form({id: 'form', ref: 'form', encType: 'multipart/form-data'}, this.state.form);
    }
});

var List = React.createClass({displayName: 'list',
    componentWillReceiveProps: function(nextProps) {
        this.setState({data: nextProps.data});
    },
    componentDidMount: function() {
        this.props.getList({request: 'list'});
    },
    handleClick: function(data){
        this.props.handleSelect(data);
    },
    updateList: function() {
        this.props.getList({request: 'list'})
    },
    render: function() {
        var listItems = this.props.data.map(function (item) {
            return (
                <Item
                    key={item.id}
                    data={item}
                    handleClick={this.handleClick.bind(this, {data: item})}
                />
            );
        }.bind(this));
        return(
            <table className="items">
                <tbody>
                    <tr>
                        <th>id</th>
                        <th>Title</th>
                    </tr>
                    {listItems}
                </tbody>
            </table>
        );
    }
});

var Item = React.createClass({displayName: 'item',
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick();
    },

    render: function() {
        return (
            <tr id={"item-"+this.props.data.id}>
                <td>{this.props.data.id}</td>
                <td><a onClick={this.handleClick} href="">{this.props.data.title}</a></td>
            </tr>
        );
    }
});
/* TODO Dash functionality to be added after all content forms work
var LeftDashboard = React.createClass({displayName: 'left-dashboard',
    render: function() {
        var functions = (function () {
            return (
                <ul className="group-actions">
                    <li className="add-function">
                        <a href="" onClick={this.handleClick}>Add</a>
                    </li>
                </ul>
            );
       }.bind(this));

        return (
            <div className="innner-dash-1">
                <h2 className="inner-dash-1-title">Day to day content</h2>
                <div className="group-row">
                    <a href="">Posts</a>
                    {functions}
                </div>
                <div className="group-row">
                    <a href="">Videos</a>
                    {functions}
                </div>
            </div>
        );
    }
});
*/
ReactDOM.render(
    React.createElement(AdminContainer, {url: '/adminapi/api/v1/generic/'}),
    document.getElementById('admin')
);

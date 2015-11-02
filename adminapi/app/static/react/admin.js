/**
 * Data object coming up needs to contain model and app as well as a FormData object containing form data
 * object{ model='user', app='auth', data{normal data to use}}
 *
 * Ajax calls to be made in the top most container
**/
var AdminContainer = React.createClass({displayName: 'admin-container',
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
        this.setState({listData: data['data']});
    },
    handleSelect: function(data) {
        this.setState({formData: data['data']});
    },
    // Make a GET request to model Type of choice and receive list of all objects
    retrieveData: function(data) {
        console.log(data);
        var url = new String();
        var schema = new String();
        var request = data['request'];
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
                this.setState({error: xhr});
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
                console.log('Creation of ' + model + ' data successful');
                this.retrieveData({request: 'list'});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr});
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
                // Re update form data, to keep form from reverting to previous incoming data
                this.handleSelect({data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr});
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        var model = data['model'];
        var app = data['app'];
        $.ajax({
            url: this.props.url + this.state.app_label + '/' + this.state.model_label + '/' + data['id'] + '/',
            dataType: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.info('Deletion of ' + model + ' data successful');
                this.retrieveData({request: 'list'});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr});
            }.bind(this)
        });
    },
    handleCancel: function() {
    this.setState({formData: {}});
    },
    render: function() {
        return (
            <div>
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
/* Store container elements

*/
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
        //TODO model_name and app_label to be retrieved in initial retrieve payload
        this.props.handleCancel();
    },
    componentWillReceiveProps: function(nextProps) {
        console.log('Props incoming');
        console.log(nextProps.data.title);
        /*
        this.setState(
           nextProps.data
        );
        */
        /**
         * Set multiselect field values using jQuery so no state data has to be handled.
         * In the future this will need to programatically check if the field is a multi-elect
        **/
        //$('select[name=sites]').val(nextProps.data.sites);
        /**
         * Updates state data with new incoming values
        **/
        /**
         * If the next incoming props is empty, it clears out all the fields except
         * the site list explicitly.
        **/
        /*
        if (jQuery.isEmptyObject(nextProps.data)) {
            var clearData = {};
            for (var field in this.props.data) {
                clearData[field] = '';
            }
            this.setState(clearData);
        }
        */
    },
    componentDidUpdate: function(prevProps, prevState) {
        console.log('Update done');
        if(this.props.modelData != prevProps.modelData || prevProps.modelData.length == 0) {
            console.log('Did update and modelDatas don not match');
            //Initial form creation or setup.
            this.setState({form: formBuilder.assemble(this, this.props.modelData)});
        }
    },
    componentDidMount: function() {
        /**
         * Use the inner ajax function to hit the api and obtain info on other model dependencies
         * that are required for fields
        **/
        console.log('Mounted');
        this.props.getModel({request: 'form'});
    },
    render: function() {
        console.log(this.props.data.id);
        return React.DOM.form({ref: 'form', encType: 'multipart/form-data'}, this.state.form);
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

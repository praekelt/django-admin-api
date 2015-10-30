/**
 * Data object coming up needs to contain model and app as well as a FormData object containing form data
 * object{ model='user', app='auth', data{normal data to use}}
 *
 * Ajax calls to be made in the top most container
**/
var AdminContainer = React.createClass({displayName: 'admin-container',
    getInitialState: function() {
        return({
            dataList: [],
            formData: {},
            modelData: [{"editable":true,"model_name":"AutoField","name":"id"},{"help_text":"","blank":true,"editable":true,"model_name":"ImageField","name":"image"},{"help_text":"","blank":true,"editable":false,"model_name":"DateTimeField","name":"date_taken"},{"help_text":"","blank":false,"editable":false,"model_name":"PositiveIntegerField","name":"view_count"},{"name":"crop_from","editable":true,"choices":[["top","Top"],["right","Right"],["bottom","Bottom"],["left","Left"],["center","Center (Default)"]],"max_length":10,"blank":true,"help_text":"","model_name":"CharField"},{"help_text":"","blank":true,"editable":true,"model_name":"ForeignKey","name":"effect"},{"name":"state","editable":false,"choices":[["unpublished","Unpublished"],["published","Published"],["staging","Staging"]],"max_length":32,"blank":true,"help_text":"Set the item state. The 'Published' state makes the item visible to the public, 'Unpublished' retracts it and 'Staging' makes the item visible on staging instances.","model_name":"CharField"},{"help_text":"Date and time on which to publish this item (state will change to 'published').","blank":true,"editable":true,"model_name":"DateTimeField","name":"publish_on"},{"help_text":"Date and time on which to retract this item (state will change to 'unpublished').","blank":true,"editable":true,"model_name":"DateTimeField","name":"retract_on"},{"name":"slug","editable":true,"max_length":255,"blank":false,"help_text":"","model_name":"SlugField"},{"name":"title","editable":true,"choices":[],"max_length":200,"blank":false,"help_text":"A short descriptive title.","model_name":"CharField"},{"name":"subtitle","editable":true,"choices":[],"max_length":200,"blank":true,"help_text":"Some titles may be the same and cause confusion in admin UI. A subtitle makes a distinction.","model_name":"CharField"},{"name":"description","editable":true,"max_length":null,"blank":true,"help_text":"A short description. More verbose than the title but limited to one or two sentences.","model_name":"TextField"},{"help_text":"Date and time on which this item was created. This is automatically set on creation, but can be changed subsequently.","blank":true,"editable":true,"model_name":"DateTimeField","name":"created"},{"help_text":"Date and time on which this item was last modified. This is automatically set each time the item is saved.","blank":false,"editable":false,"model_name":"DateTimeField","name":"modified"},{"help_text":"","blank":true,"editable":true,"model_name":"ForeignKey","name":"owner"},{"name":"owner_override","editable":true,"choices":[],"max_length":256,"blank":true,"help_text":"If the author is not a registered user then set it here, eg. Reuters.","model_name":"CharField"},{"help_text":"","blank":false,"editable":false,"model_name":"ForeignKey","name":"content_type"},{"name":"class_name","editable":false,"choices":[],"max_length":32,"blank":false,"help_text":"","model_name":"CharField"},{"help_text":"Primary category for this item. Used to determine the object's absolute/default URL.","blank":true,"editable":true,"model_name":"ForeignKey","name":"primary_category"},{"help_text":"Enable commenting for this item. Comments will not display when disabled.","blank":true,"editable":true,"model_name":"BooleanField","name":"comments_enabled"},{"help_text":"Enable anonymous commenting for this item.","blank":true,"editable":true,"model_name":"BooleanField","name":"anonymous_comments"},{"help_text":"Close commenting for this item. Comments will still display, but users won't be able to add new comments.","blank":true,"editable":true,"model_name":"BooleanField","name":"comments_closed"},{"help_text":"Enable liking for this item. Likes will not display when disabled.","blank":true,"editable":true,"model_name":"BooleanField","name":"likes_enabled"},{"help_text":"Enable anonymous liking for this item.","blank":true,"editable":true,"model_name":"BooleanField","name":"anonymous_likes"},{"help_text":"Close liking for this item. Likes will still display, but users won't be able to add new likes.","blank":true,"editable":true,"model_name":"BooleanField","name":"likes_closed"},{"name":"image_attribution","editable":true,"choices":[],"max_length":256,"blank":true,"help_text":"Attribution for the canonical image, eg. Shutterstock.","model_name":"CharField"},{"help_text":"","blank":false,"editable":false,"model_name":"PositiveIntegerField","name":"comment_count"},{"help_text":"","blank":false,"editable":false,"model_name":"PositiveIntegerField","name":"vote_total"},{"help_text":"","blank":false,"editable":true,"model_name":"OneToOneField","name":"modelbase_ptr"},{"help_text":"","blank":true,"editable":true,"model_name":"RichTextField","name":"content"}],
            error: ''
        });
    },
    handleListState: function(data) {
        console.log('List state update');
        switch(data['model']) {
            case 'post':
                this.setState({postList: data['data']});
                break;
            default:
                return
        }
    },
    handleSelect: function(data) {
        this.setState({formData: data['data']});
    },
    handleCancel: function(data) {
        console.log('Cancel');
        switch(data['model']) {
            case 'post':
                this.setState({post: {}});
                break;
            default:
                return
        }
    },
    // Make a GET request to model Type of choice and receive list of all objects
    retrieveData: function(data) {
        var model = data['model'];
        var app = data['app'];

        $.ajax({
            url: this.props.url + app + '/' + model + '/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                this.handleListState({model: model, app: app, data});
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
        console.log(data);
        // TODO temp hardcoded model and app
        var model = 'post';
        var app = 'post';
        //var model = data['model'];
        //var app = data['app'];
        $.ajax({
            url: this.props.url + app + '/' + model + '/',
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
                this.retrieveData({model: model, app: app});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr});
            }.bind(this)
        });
    },
    handleUpdate: function(data) {
        var model = data['model'];
        var app = data['app'];
        $.ajax({
            url: this.props.url + app + '/' + model + '/' + data['id'] + '/',
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
                console.info('Update of ' + model + ' data successful');
                this.retrieveData({model: model, app: app});
                // Re update form data, to keep form from reverting to previous incoming data
                this.handleSelect({model: model, app: app, data});
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
            url: this.props.url + app + '/' + model + '/' + data['id'] + '/',
            dataType: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.info('Deletion of ' + model + ' data successful');
                this.retrieveData({model: model, app: app});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({error: xhr});
            }.bind(this)
        });
    },

    render: function() {
        return (
            <div className="forms-container">
                {this.state.error.responseText}
                <Form
                    data={this.state.formData}
                    modelData={this.state.modelData}
                    handleSubmit={this.handleSubmit}
                    handleUpdate={this.handleUpdate}
                    handleDelete={this.handleDelete}
                    handleCancel={this.handleCancel}
                />
            </div>
        );
    }
});

var Form = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {form: React.DOM.div(null, "empty")};
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var form = ReactDOM.findDOMNode(this.refs.form);
        var formData = new FormData(form);
        if(!this.props.data.id) {
        console.log('Create');
        this.props.handleSubmit(
            {model: this.props.modelData['model_name'], app: this.props.modelData['app_label'], formData: formData}
        );
        } else {
        console.log('Update');
        this.props.handleUpdate(
            {id: this.props.data.id, model: this.props.modelData['model_name'], app: this.props['app_label'], formData: formData}
        );
        }
    },
    handleDelete: function(e) {
        e.preventDefault();
        console.log('Delete');
        this.props.handleDelete(
            {model: this.props.modelData['model_name'], app: this.props.modelData['app_label'], id: this.props.data.id}
        );
    },
    handleCancel: function(e) {
        e.preventDefault();
        this.props.handleCancel({model: this.modelData.model_name});
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextData.modelData != this.props.modelData) {
            //Initial form creation or setup.
        }
        console.log('Props incoming');
        console.log(nextProps.data);
        /**
         * Set multiselect field values using jQuery so no state data has to be handled.
         * In the future this will need to programatically check if the field is a multi-elect
        **/
        //$('select[name=sites]').val(nextProps.data.sites);
        /**
         * Updates state data with new incoming values
        **/
        this.setState(
           nextProps.data
        );
        /**
         * If the next incoming props is empty, it clears out all the fields except
         * the site list explicitly.
        **/
        if (jQuery.isEmptyObject(nextProps.data)) {
            var clearData = {};
            for (var field in this.state) {
                clearData[field] = '';
            }
            this.setState(clearData);
        }
    },
    componentDidMount: function() {
        /**
         * Use the inner ajax function to hit the api and obtain info on other model dependencies
         * that are required for fields
        **/
        this.setState({form: formBuilder.assemble(this, this.props.modelData)});
    },
    render: function() {
        return React.DOM.form({ref: 'form', encType: 'multipart/form-data'}, this.state.form);
    }
});

var PostList = React.createClass({displayName: 'posts-list',
    getInitialState: function() {
        return {data: []};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({data: nextProps.data});
    },
    componentDidMount: function() {
        this.props.getList({app: 'post', model: 'post'});
    },
    handleClick: function(data){
        this.props.handleSelect(data);
    },
    updateList: function() {
        this.props.getList({app: 'post', model: 'post'})
    },
    render: function() {
        var listItems = this.state.data.map(function (post) {
            return (
                <Post
                    key={post.id}
                    data={post}
                    handleClick={this.handleClick.bind(this, {data: post, model: 'post' ,app: 'post'})}
                />
            );
        }.bind(this));
        return(
            <table className="posts">
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

var Post = React.createClass({displayName: 'post',
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

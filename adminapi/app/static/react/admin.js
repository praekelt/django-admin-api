/**
 * Data object coming up needs to contain model and app as well as a FormData object containing form data
 * object{ model='user', app='auth', data{normal data to use}}
 *
 * Ajax calls to be made in the top most container
**/
var AdminContainer = React.createClass({displayName: 'admin-container',
    getInitialState: function() {
        return({
            postList: [],
            videoList: [],
            post: {},
            video: {},
            error: ''
        });
    },
    handleListState: function(data) {
        console.log('List state update');
        switch(data['model']) {
            case 'post':
                this.setState({postList: data['data']});
                break;
            case 'video':
                this.setState({videoList: data['data']});
                break;
            default:
                return
        }
    },
    handleSelect: function(data) {
        console.log('Item selected');
        switch(data['model']) {
            case 'post':
                this.setState({post: data['data']});
                break;
            case 'video':
                this.setState({video: data['data']});
                break;
            default:
                return
        }
    },
    handleCancel: function(data) {
        console.log('Cancel');
        switch(data['model']) {
            case 'post':
                this.setState({post: {}});
                break;
            case 'video':
                this.setState({video: {}});
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
        var model = data['model'];
        var app = data['app'];
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
            <div className="forms">
                {this.state.error.responseText}
                <PostForm
                    url={this.props.url}
                    data={this.state.post}
                    handleSubmit={this.handleSubmit}
                    handleUpdate={this.handleUpdate}
                    handleDelete={this.handleDelete}
                    handleCancel={this.handleCancel}
                />
                <PostList
                    data={this.state.postList}
                    handleSelect={this.handleSelect}
                    getList={this.retrieveData}
                />
            </div>
        );
    }
});

var PostForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {
            value: '',
            fieldData: [],
            sites: []
        };
    },
    retrieveFieldData: function(data) {
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
                console.log(data);
                this.setState({fieldData: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(xhr.responseText);
            }.bind(this)
        });
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var form = ReactDOM.findDOMNode(this.refs.posts);
        var formData = new FormData(form);
        if(!this.props.data.id) {
        console.log('Create');
        this.props.handleSubmit(
            {model: 'post', app: 'post', formData: formData}
        );
        } else {
        console.log('Update');
        this.props.handleUpdate(
            {id: this.props.data.id, model: 'post', app: 'post', formData: formData}
        );
        }
    },
    handleDelete: function(e) {
        e.preventDefault();
        console.log('Delete');
        this.props.handleDelete(
            {model: 'post', app: 'post', id: this.props.data.id}
        );
    },
    handleCancel: function(e) {
        e.preventDefault();
        this.props.handleCancel({model: 'post'});
    },
    componentWillReceiveProps: function(nextProps) {
        console.log('Props incoming');
        console.log(nextProps.data);
        /**
         * Set multiselect field values using jQuery so no state data has to be handled.
         * In the future this will need to programatically check if the field is a multi-elect
        **/
        $('select[name=sites]').val(nextProps.data.sites);
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
                if (field != 'fieldData') {
                    clearData[field] = '';
                }
            }
            this.setState(clearData);
        }
    },
    componentDidMount: function() {
        /**
         * Use the inner ajax function to hit the api and obtain info on other model dependencies
         * that are required for fields
        **/
        this.retrieveFieldData({app: 'sites', model: 'site'});
    },
    onKeyPress: function(e) {
        console.log(e);
    },
    render: function() {
        var siteList = this.state.fieldData.map(function (site) {
            return (
                <option key={site.id} value={site.id}>{site.name}</option>
            );
        }.bind(this));
        return (
            <form className="posts" ref="posts" encType="multipart/form-data">
                <div>
                    <label>Title</label>
                    <input valueLink={this.linkState('title')} type="text" name="title" />
                </div>
                <div>
                    <label>Image</label>
                    <input type="file" name="image" />
                </div>
                <div>
                    <label>Crop form</label>
                    <select valueLink={this.linkState('crop_from')} name="crop_from" defaultValue="">
                        <option value="">--------</option>
                        <option value="top">Top</option>
                        <option value="right">Right</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="center">Center (Default)</option>
                    </select>
                </div>
                <div>
                    <label>Publish on</label>
                    <input valueLink={this.linkState('publish_on')} type="datetime-local" name="publish_on" />
                </div>
                <div>
                    <label>Retract on</label>
                    <input valueLink={this.linkState('retract_on')} type="datetime-local" name="retract_on" />
                </div>
                <div>
                    <label>Slug</label>
                    <input valueLink={this.linkState('slug')} type="text" name="slug" />
                </div>
                <div>
                    <label>Subtitle</label>
                    <input valueLink={this.linkState('subtitle')} type="text" name="subtitle" />
                </div>
                <div>
                    <label>Description</label>
                    <textarea valueLink={this.linkState('description')} name="description"></textarea>
                </div>
                <div>
                    <label>Created date & time</label>
                    <input valueLink={this.linkState('created')} type="datetime-local" name="created" />
                </div>
                <div>
                    <label>Liking Closed</label>
                    <input type="checkbox" value="true" checkedLink={this.linkState('likes_closed')} name="likes_closed" />
                </div>
                <div>
                    <label>Liking enabled</label>
                    <input type="checkbox" value="true" checkedLink={this.linkState('likes_enabled')} name="likes_enabled" />
                </div>
                <div>
                    <label>Owner override</label>
                    <input valueLink={this.linkState('owner_override')} type="text" name="owner_override" />
                </div>
                <div>
                    <select
                        name="sites"
                        defaulValue=""
                        multiple
                     >
                        {siteList}
                    </select>
                </div>
                <button className="submit" title="Submit Data" onClick={this.handleSubmit}>Create/Update</button>
                <button onClick={this.handleCancel} title="Clear all fields">Cancel</button>
                <button onClick={this.handleDelete} title="Delete selected item">Delete</button>
            </form>
        );
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
                <td><a onClick={this.handleClick} href=""> {this.props.data.title}</a></td>
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

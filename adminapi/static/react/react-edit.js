var EditContainer = React.createClass({displayName: 'ReactEdit',
    handleLoginSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
                xhr.setRequestHeader('Class', 'TestModel');
                this.setState({infoMessage: ''});
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Login success')
                this.setState({infoMessage: 'Success data set: ' + data});
                console.log('state set');
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({infoMessage: jsonError.detail});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {infoMessage: ''};
    },
    render: function() {
        return (
            <div className="edit-container" >
                <EditForm onEditSubmit={ this.handleEditSubmit } />
                <p id="info-block">{ this.state.infoMessage }</p>
            </div>
        );
    }
});

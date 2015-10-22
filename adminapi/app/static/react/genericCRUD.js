function errorCompiler(data) {
    var errorString = '';
    if(data.car) {
        errorString += '\n Car: ' + data.car;
    }
    if(data.enginesize){
        errorString += '\n Engine Size: ' + data.enginesize;
    }
    if(data.manufacturer){
        errorString += '\n Manufacturer: ' + data.manufacturer;
    }
    if(data.title){
        errorString += '\n Title: ' + data.title;
    }
    if(data.image) {
        errorString += '\n Image: ' + data.image;
    }
    return errorString;
}

var Form = React.createClass({
    provideManuacturerData: function(data) {
        this.setState({manufacturerData: data});
    },
    provideCarData: function(data) {
        this.setState({carData: data});
    },
    provideEngineSizeData: function(data) {
        this.setState({engineSizeData: data});
    },
    getInitialState: function() {
        return {carData: [], engineSizeData: [], manufacturerData: []};
    },
    render() {
        return(
            <div>
                <ManufacturerContainer
                    url={this.props.url}
                    provideData={this.provideManuacturerData}
                />
                <CarContainer
                    url={this.props.url}
                    manufacturerData={this.state.manufacturerData}
                    provideData={this.provideCarData}
                />
                <EngineSizeContainer
                    url={this.props.url}
                    carData={this.state.carData}
                    provideData={this.provideEngineSizeData}
                />
                <ImageModelContainer
                />
            </div>
        );
    }
});

var ManufacturerContainer = React.createClass({displayName: 'manufacturer-form',
    retrieveData: function(data) {
        $.ajax({
            url: this.props.url + 'manufacturer/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Retrieval success')
                this.setState({manufacturerData: data});
                this.props.provideData(data);
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
            url: this.props.url + 'manufacturer/',
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
                this.retrieveData();
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
            url: this.props.url + 'manufacturer/' +data.id + '/',
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
                this.retrieveData();
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.warn(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        $.ajax({
            url: this.props.url + 'manufacturer/' + data.id + '/',
            datatype: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                alert('Successfully deleted');
                console.log('Delete success');
                this.retrieveData();
                this.handleCancel();
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
        return {data: null, formData: {}, manufacturerData: []};
    },
    componentDidMount: function() {
        this.retrieveData();
    },

    render: function() {
        return (
            <div>
            <h1>Manufacturer form</h1>
            <ManufacturerForm
                data={this.state.formData}
                onSubmit={this.handleSubmit}
                onUpdate={this.handleUpdate}
                onDelete={this.handleDelete}
                handleCancel={this.handleCancel}
            />
            <ManufacturerList
                data={this.state.manufacturerData}
                handleItemSelect={this.selectListItem}
            />
            </div>
        );
    }
});

var ManufacturerForm = React.createClass({displayName: 'form',
    mixins: [React.addons.LinkedStateMixin],
    handleSubmit: function(e) {
        e.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.title).value.trim();
        // Final catch if HTML5 validation fails
        if(!title) {
            alert('Please fill in the title field');
            return;
        }
        if(this.props.data.id == null) {
            this.props.onSubmit({
                title: title,
            });
        } else {
            this.props.onUpdate({
                id: this.props.data.id,
                title: title,
            });
        }
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
            title: nextProps.data.title,
        });
    },
    render: function() {
        return (
            <form
                className="manufacturer-form"
                onSubmit={this.handleSubmit}
            >
                <h2>Title:</h2>
                <input
                    type="text"
                    valueLink={this.linkState('title')}
                    placeholder="Add title"
                    ref="title"
                    maxLength="32"
                    required
                />
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

var ManufacturerList = React.createClass({displayName: 'manufactuer-list',
    handleClick: function(manufacturer){
        this.props.handleItemSelect(manufacturer);
    },

    render: function() {
        var listItems = this.props.data.map(function (manufacturer) {
            return (
                <Manufacturer
                    key={manufacturer.id}
                    data={manufacturer}
                    handleClick={this.handleClick.bind(this, manufacturer)}
                />
            );
        }.bind(this));
        return(
            <table className="manufacturerTable">
                <tbody>
                    <tr>
                        <th>id</th>
                        <th>Manufacturer name</th>
                    </tr>
                    {listItems}
                </tbody>
            </table>
        );
    }
});

var Manufacturer = React.createClass({displayName: 'manufacturer',
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick(this.props.data);
    },

    render: function() {
        return (
            <tr id={"item-"+this.props.data.id}>
                <td>{this.props.data.id}</td>
                <td><a onClick={this.handleClick} href=''> {this.props.data.title}</a></td>
            </tr>
        );
    }
});

var CarContainer = React.createClass({displayName: 'car-form',
    retrieveData: function(data) {
        $.ajax({
            url: this.props.url + 'car/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Retrieval success')
                this.setState({carData: data});
                this.props.provideData(data);
            }.bind(this),
            error: function(xhr, status, err) {
                if(xhr.status == 403) {
                    window.location.replace('/permission-denied/')
                }
            }.bind(this)
        });
    },
    handleSubmit: function(data) {
        console.log('Car');
        console.log(data);
        $.ajax({
            url: this.props.url + 'car/',
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
                this.retrieveData();
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
            url: this.props.url + 'car/' + data.id + '/',
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
                this.retrieveData();
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.warn(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        $.ajax({
            url: this.props.url + 'car/' + data.id + '/',
            datatype: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                alert('Successfully deleted');
                console.log('Delete success');
                this.handleCancel();
                this.retrieveData();
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
        return {data: null, formData: {}, carData: [], manufacturerData: []};
    },
    componentDidMount: function() {
        this.retrieveData();
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            manufacturerData: nextProps.manufacturerData
        });
    },

    render: function() {
        return (
            <div>
            <h1>Car form</h1>
            <CarForm
                data={this.state.formData}
                manufacturers={this.state.manufacturerData}
                onSubmit={this.handleSubmit}
                onUpdate={this.handleUpdate}
                onDelete={this.handleDelete}
                handleCancel={this.handleCancel}
            />
            <CarList
                data={this.state.carData}
                handleItemSelect={this.selectListItem}
            />
            </div>
        );
    }
});

var CarForm = React.createClass({displayName: 'form',
    mixins: [React.addons.LinkedStateMixin],
    handleSubmit: function(e) {
        e.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.title).value.trim();
        if(!title) {
            alert('Please fill in the title field');
            return;
        }
        if(this.props.data.id == null) {
            this.props.onSubmit({
                title: title,
                manufacturer: this.state.manufacturer
            });
        } else {
            this.props.onUpdate({
                id: this.props.data.id,
                title: title,
                manufacturer: this.state.manufacturer
            });
        }
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
    handleSelect: function(manufacturer) {
        this.setState({manufacturer: manufacturer});
    },
    getInitialState: function() {
        return {value: ''};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            title: nextProps.data.title,
            manufacturer: nextProps.data.manufacturer,
            manufacturers: nextProps.manufacturers
        });
    },
    render: function() {
        return (
            <form
                className="car-form"
                onSubmit={this.handleSubmit}
            >
                <h2>Title:</h2>
                <input
                    type="text"
                    valueLink={this.linkState('title')}
                    placeholder="Add title"
                    ref="title"
                    maxLength="32"
                    required
                />
                <h2>Manufacturers:</h2>
                <ManufacturerDropDown
                    manufacturers={this.props.manufacturers}
                    manufacturer={this.state.manufacturer}
                    handleSelect={this.handleSelect}
                />
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

var ManufacturerDropDown = React.createClass({displayName: 'drop-down',
    getInitialState:function(){
        return {selectValue: 0};
    },
    handleChange:function(e){
        this.setState({selectValue:e.target.value});
        this.props.handleSelect(e.target.value)
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.manufacturer != undefined){
            this.setState({
                selectValue: nextProps.manufacturer,
            });
        }else{
            this.setState({
                selectValue: 0,
            });
        }
    },
    render: function() {
        var id=this.state.selectValue;
        var listItems = this.props.manufacturers.map(function (manufacturer) {
            return (
                <option value={manufacturer.id}>{manufacturer.title}</option>
            );
        }.bind(this));
        return (
            <select
                value={this.state.selectValue}
                onChange={this.handleChange}
            >
            <option value={0}>--Please select a manufacturer--</option>
            {listItems}
            </select>
        );
    }
});

var CarList = React.createClass({displayName: 'car-list',
    handleClick: function(car){
        console.log('CarList: handleClick');
        this.props.handleItemSelect(car);
    },

    render: function() {
        var listItems = this.props.data.map(function (car) {
            return (
                <Car
                    data={car}
                    handleClick={this.handleClick.bind(this, car)}
                />
            );
        }.bind(this));
        return(
            <table className="carTable">
                <tbody>
                    <tr>
                        <th>id</th>
                        <th>Car name</th>
                        <th>Manufacturer</th>
                        <th>Engine size</th>
                    </tr>
                    {listItems}
                </tbody>
            </table>
        );
    }
});

var Car = React.createClass({displayName: 'car',
    handleClick: function(e){
        console.log('Car: handleClick');
        e.preventDefault();
        this.props.handleClick(this.props.data);
    },

    render: function() {
        return (
            <tr key={"item-"+this.props.data.id}>
                <td>{this.props.data.id}</td>
                <td><a onClick={this.handleClick} href=''> {this.props.data.title}</a></td>
                <td>{this.props.data.manufacturer}</td>
                <td>{this.props.data.enginesize}</td>
            </tr>
        );
    }
});

var EngineSizeContainer = React.createClass({displayName: 'engine-size-form',
    retrieveData: function(data) {
        $.ajax({
            url: this.props.url + 'enginesize/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Retrieval success')
                this.setState({engineSizeList: data});
                this.props.provideData(data);
                this.handleCancel();
            }.bind(this),
            error: function(xhr, status, err) {
                if(xhr.status == 403) {
                    window.location.replace('/permission-denied/')
                }
            }.bind(this)
        });
    },
    handleSubmit: function(data) {
        console.log(JSON.stringify(data));
        $.ajax({
            url: this.props.url + 'enginesize/',
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Submit success')
                alert('Successfully submitted');
                this.retrieveData();
                this.handleCancel();
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
            url: this.props.url + 'enginesize/' + data.id + '/',
            contentType: 'application/json',
            dataType: 'json',
            type: 'PUT',
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Update success');
                alert('Successfully updated');
                this.retrieveData();
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.warn(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        $.ajax({
            url: this.props.url + 'enginesize/' + data.id + '/',
            datatype: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                alert('Successfully deleted');
                console.log('Delete success');
                this.retrieveData();
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
        return {data: null, formData: {}, engineSizeList: [], carData: []};
    },
    componentDidMount: function() {
        this.retrieveData();
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            carData: nextProps.carData
        });
    },

    render: function() {
        return (
            <div>
            <h1>Engine size form</h1>
            <EngineSizeForm
                data={this.state.formData}
                cars={this.state.carData}
                onSubmit={this.handleSubmit}
                onUpdate={this.handleUpdate}
                onDelete={this.handleDelete}
                handleCancel={this.handleCancel}
            />
            <EngineSizeList
                data={this.state.engineSizeList}
                handleItemSelect={this.selectListItem}
            />
            </div>
        );
    }
});

var EngineSizeForm = React.createClass({displayName: 'engine-size-form',
    mixins: [React.addons.LinkedStateMixin],
    handleSubmit: function(e) {
        e.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.title).value.trim();
        // Final catch if HTML5 validation fails
        if(!title) {
            alert('Please fill in the title field');
            return;
        }
        if(this.props.data.id == null) {
            this.props.onSubmit({
                title: title,
                car: this.state.carIds.slice()
            });
        } else {
            this.props.onUpdate({
                id: this.props.data.id,
                title: title,
                car: this.state.carIds
            });
        }
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
    handleSelect: function(carIds) {
        this.setState({carIds: carIds});
    },
    getInitialState: function() {
        return {value: '', carIds: [], cars: []};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            title: nextProps.data.title,
            cars: nextProps.cars
        });
    },
    render: function() {
        return (
            <form
                className="engine-size-form"
                onSubmit={this.handleSubmit}
            >
                <h2>Title:</h2>
                <input
                    type="text"
                    valueLink={this.linkState('title')}
                    placeholder="Add title"
                    ref="title"
                    maxLength="32"
                    required
                />
                <h2>Cars:</h2>
                <CarsCheckList
                    id={this.props.data.id}
                    selectedCars={this.props.data.car}
                    cars={this.state.cars}
                    handleSelect={this.handleSelect}
                />
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

var CarsCheckList = React.createClass({displayName: 'checkboxes',
    getInitialState: function(){
        return {data: null, carIds: []};
    },
    handleChange: function(e){
        console.log(e.target.checked);
        var value = parseInt(e.target.value);
        if(e.target.checked){
            this.state.carIds.push(value);
            this.props.handleSelect(this.state.carIds);
        }else{
            var pos = this.state.carIds.indexOf(e.target.value);
            this.state.carIds.splice(pos, 1);
            this.props.handleSelect(this.state.carIds);
        }
    },
    componentWillReceiveProps: function(nextProps) {
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        if (nextProps.selectedCars == undefined) {
            return true;
        }
        if(nextProps.id == this.props.id){
            return false;
        } else {
            return true;
        }
    },
    componentDidUpdate: function(prevProps, prevState) {
        console.log('Checklist component updated');
        var checkboxes = document.getElementsByClassName('car-checkboxes');
        if(this.props.selectedCars == undefined){
            return
        }
        for (i = 0; i < checkboxes.length; ++i) {
            if(checkboxes[i].checked){
                checkboxes[i].click();
            }
        }
        for (i = 0; i < checkboxes.length; ++i) {
                var value = parseInt(checkboxes[i].value);
                if(this.props.selectedCars.indexOf(value, 0) >= 0){
                    checkboxes[i].click();
                }
        }
    },
    render: function() {
        var listItems = this.props.cars.map(function (car) {
            return (
                <label
                    key={"item" + car.id}>
                    <input
                        className="car-checkboxes"
                        type="checkbox"
                        value={car.id}
                        onClick={this.handleChange}
                    />
                    {car.title}-{car.id}
                </label>
            );
        }.bind(this));
        return (
            <div>
                {listItems}
            </div>
        );
    }
});

var EngineSizeList = React.createClass({displayName: 'engine-size-list',
    handleClick: function(engineSize){
        this.props.handleItemSelect(engineSize);
    },

    render: function() {
        var listItems = this.props.data.map(function (engineSize) {
            return (
                <EngineSize
                    key={engineSize.id}
                    data={engineSize}
                    handleClick={this.handleClick.bind(this, engineSize)}
                />
            );
        }.bind(this));
        return(
            <table className="carTable">
                <tbody>
                    <tr>
                        <th>id</th>
                        <th C>Engine size</th>
                        <th>Car</th>
                    </tr>
                    {listItems}
                </tbody>
            </table>
        );
    }
});

var EngineSize = React.createClass({displayName: 'engine-size',
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick(this.props.data);
    },

    render: function() {
        return (
            <tr id={"item-"+this.props.data.id}>
                <td>{this.props.data.id}</td>
                <td><a onClick={this.handleClick} href=''> {this.props.data.title}</a></td>
                <td>{this.props.data.car}</td>
            </tr>
        );
    }
});

function dataURItoBlob(dataURI) {
    var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
    return new Blob([atob(arr[1])], {type: 'image/png'});
}

var ImageModelContainer = React.createClass({displayName: 'image-model-form',
    retrieveData: function(data) {
        $.ajax({
            url: '/api/v1/generic/api/imagemodel/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Retrieval success')
                this.setState({imageModelList: data});
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
            url: '/api/v1/generic/api/imagemodel/',
            dataType: 'json',
            type: 'POST',
            data: data['formData'],
            contentType: false,
            processData: false,
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            success: function(data) {
                console.log('Submit success')
                alert('Successfully submitted');
                this.retrieveData();
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
            url: '/api/v1/generic/api/imagemodel/'+ data.id + '/',
            dataType: 'json',
            type: 'PUT',
            data: data['formData'],
            contentType: false,
            processData: false,
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Update success');
                alert('Successfully updated');
                this.retrieveData();
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.warn(xhr.responseText);
                alert(errorCompiler(jsonError));
            }.bind(this)
        });
    },
    handleDelete: function(data) {
        $.ajax({
            url: '/api/v1/generic/api/imagemodel/'+ data.id + '/',
            datatype: 'json',
            type: 'DELETE',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
            }.bind(this),
            cache: false,
            success: function(data) {
                alert('Successfully deleted');
                console.log('Delete success');
                this.retrieveData();
                this.handleCancel();
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
        return {data: {}, formData: {}, imageModelList: []};
    },
    componentDidMount: function() {
        this.retrieveData();
    },

    render: function() {
        return (
            <div>
            <h1>Image form</h1>
            <ImageForm
                data={this.state.formData}
                onSubmit={this.handleSubmit}
                onUpdate={this.handleUpdate}
                onDelete={this.handleDelete}
                handleCancel={this.handleCancel}
            />
            <ImageModelList
                data={this.state.imageModelList}
                handleItemSelect={this.selectListItem}
            />
            </div>
        );
    }
});

var ImageForm = React.createClass({displayName: 'image-form',
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {data_uri: null};
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.title).value.trim();
        var image = ReactDOM.findDOMNode(this.refs.image).files[0];
        // Final catch if HTML5 validation fails
        if(!title) {
            alert('Please fill in the title field');
            return;
        }
        var formData = new FormData();
        formData.append('title', title);

        if(image != null) {
            formData.append('image', image);
        }else{
            alert('Please attach an image file');
            return
        }

        if(this.props.data.id == null) {
            this.props.onSubmit({
                formData: formData
            });
        } else {
                formData.append('id', this.props.data.id);
            this.props.onUpdate({
                formData: formData,
                id: this.props.data.id
            });
        }
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
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            title: nextProps.data.title,
        });
    },
    render: function() {
        return (
            <form
                className="image-form"
                onSubmit={this.handleSubmit}
            >
                <h2>Title:</h2>
                <input
                    type="text"
                    valueLink={this.linkState('title')}
                    placeholder="Add title"
                    ref="title"
                    maxLength="32"
                    required
                />
                <h2>Image:</h2>
                <input ref="image" id="image-file" type="file"/>
                <input type="submit" value="Submit" />
                <input onClick={this.handleDelete} type="button" value="Delete" />
                <input onClick={this.handleCancel} type="button" value="Cancel" />
            </form>
        );
    }
});

var ImageModelList = React.createClass({displayName: 'image-model-list',
    handleClick: function(imageModel){
        this.props.handleItemSelect(imageModel);
    },

    render: function() {
        var listItems = this.props.data.map(function (imageModel) {
            return (
                <ImageModel
                    key={imageModel.id}
                    data={imageModel}
                    handleClick={this.handleClick.bind(this, imageModel)}
                />
            );
        }.bind(this));
        return(
            <table className="imageTable">
                <tbody>
                    <tr>
                        <th>id</th>
                        <th C>Image</th>
                        <th>URL</th>
                    </tr>
                    {listItems}
                </tbody>
            </table>
        );
    }
});

var ImageModel = React.createClass({displayName: 'imagem-model',
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick(this.props.data);
    },

    render: function() {
        return (
            <tr id={"item-"+this.props.data.id}>
                <td>{this.props.data.id}</td>
                <td><a onClick={this.handleClick} href=''> {this.props.data.title}</a></td>
                <td>{this.props.data.image}</td>
            </tr>
        );
    }
});

ReactDOM.render(
    React.createElement(Form,{url: '/api/v1/generic/adminapi/'}),
    document.getElementById('generic')
);


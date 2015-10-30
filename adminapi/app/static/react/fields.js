var formBuilder = {
    assemble: function(context, data) {
        var elements=[];
        // Hardcoded form field data, for testing the select fields
        data = [{"name":"slug","editable":true,"max_length":255,"blank":false,"help_text":"","model_name":"SlugField"}, {"name":"state","editable":false,"choices":[["unpublished","Unpublished"],["published","Published"],["staging","Staging"]],"max_length":32,"blank":true,"help_text":"Set the item state. The 'Published' state makes the item visible to the public, 'Unpublished' retracts it and 'Staging' makes the item visible on staging instances.","model_name":"CharField"},{"help_text":"Date and time on which to publish this item (state will change to 'published').","blank":true,"editable":true,"model_name":"DateTimeField","name":"publish_on"},{"help_text":"Date and time on which to retract this item (state will change to 'unpublished').","blank":true,"editable":true,"model_name":"DateTimeField","name":"retract_on"}, {"name":"title","editable":true,"choices":[],"max_length":200,"blank":false,"help_text":"A short descriptive title.","model_name":"CharField"}, {"name":"crop_from","editable":true,"choices":[["top","Top"],["right","Right"],["bottom","Bottom"],["left","Left"],["center","Center (Default)"]],"max_length":10,"blank":true,"help_text":"","model_name":"CharField"}];
        for (i = 0; i < data.length; i++) {
            console.log('Field Name: ' + data[i]['name']);
            elements.push(React.DOM.label({name: data[i]['name']}, data[i]['name']));
            elements.push(this.elementAssembler(context, data[i]));
            //elements.push(React.DOM.span({name: 'help'}, data[i]['help_text']));
        }
        elements.push(this.buttons(context));
        return elements;
    },
    // Currently nont implemented, might not be needed at all
    /*
    formElement: function(context, elements) {
        attrs = {
            className: 'form',
            encType: 'multipart/form-data',
            ref: 'form'
        }
        form = React.DOM.form(attrs, elements);
        return form;
    },
    */
    elementAssembler: function(context, data) {
        var element = null;
        switch (data['model_name']) {
            case 'CharField':
            case 'ImageField':
            case 'DateTimeField':
            case 'SlugField':
                element = this.inputElement(context, data);
                break;
            case 'TextField':
            case 'RichTextField':
                element = this.textAreaElement(context,data);
                break;
        }
        return element
    },

    inputElement: function(context, data) {
        var attrs = null;
        attrs = {
            name: data.name
        }
        if (data['model_name'] == 'CharField' && data['choices'].length > 0) {
            console.info('Char Choice field IF statement Fired');
            // TODO Works
            //return React.DOM.select({name: data.name}, [React.DOM.option(null, 'ooo'), React.DOM.option(null, 'aaa')]);
            // TODO both don't work
            //return React.DOM.select({name: data.name}, this.optionElement(data));
            //return this.selectElement(context, data);
        }

        switch (data['model_name']) {
            case 'CharField':
            case 'SlugField':
                attrs['type'] = 'text';
                attrs['maxLength'] = data.max_length;
                break;
            case 'ImageField':
                attrs['type'] = 'file';
                break;
            case 'DateTimeField':
                attrs['type'] = 'datetime';
                break;
        }
        element = React.DOM.input(attrs);
        return element;
    },

    textAreaElement: function(context, data) {
        attrs = {

        }
        element = React.DOM.textarea(attrs);
        return element;
    },

    selectElement: function(context, data) {
        var attrs = null;
        var options = null;
        attrs = {
            name: data.name
        }
        switch(data['model_name']){
            //case 'ManyToMany':
                //attrs['multiselect'] = true;
                //options = optionElement(data);
                //break;
            //case 'ForeignKey':
                //options = optionElement(data);
                //break;
            case 'CharField':
                options = this.optionElement(data);
                break;
        }
        element = React.DOM.select(attrs, options);
        return element;
    },

    optionElement: function(data) {
        var options = [];
        for (i = 0; i < data['choices'].length; i++) {
            options.push(React.DOM.option({key: i, value: data['choices'][i][0]}, data['choices'][i][1]));
        }
        return options;
    },

     buttons: function(context, data) {
        var buttons = [];
        buttons.push(React.DOM.button(
            {
                name: "submit",
                title: "Submit Data",
                onClick: context.handleSubmit},
            'Post'
            ));
        buttons.push(React.DOM.button(
            {
                name: "cancel",
                title: "Clear all fields",
                onClick: context.handleCancel},
            'Cancel'
            ));
        buttons.push(React.DOM.button(
            {
                name: "delete",
                title: "Delete selected item",
                onClick: context.handleSubmit},
            'Delete'
            ));
        return buttons;
    }
}

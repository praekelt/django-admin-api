var formBuilder = {
    count: 0,
    keyCount: function() {
        return 'key-' + this.count++;
    },
    assemble: function(context, data) {
        console.log(context);
        var elements = new Array();
        for (var i = 0; i < data.length; i++) {
            elements.push(React.DOM.div({key: 'div-'+i},
                React.DOM.label({key: 'element-'+i, name: data[i]['name']}, data[i]['verbose_name']),
                this.elementAssembler(context, data[i]),
                React.DOM.span({name: 'help'}, data[i]['help_text'])
                ));
            //elements.push(React.DOM.label({key: "element-"+i, name: data[i]['name']}, data[i]['verbose_name']));
            //elements.push(this.elementAssembler(context, data[i]));
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
        return element;
    },

    inputElement: function(context, data) {
        var attrs = {
            key: this.keyCount(),
            name: data.name
        }
        if (data['model_name'] == 'CharField' && data['choices'].length > 0) {
            return React.DOM.select({key: this.keyCount(), name: data.name}, this.optionElement(data));
        }

        switch (data['model_name']) {
            case 'CharField':
            case 'SlugField':
                attrs['type'] = 'text';
                attrs['maxLength'] = data.max_length;
                attrs['valueLink'] = context.linkState(data['name']);
                break;
            case 'ImageField':
                attrs['type'] = 'file';
                break;
            case 'DateTimeField':
                attrs['type'] = 'datetime';
                attrs['valueLink'] = context.linkState(data['name']);
                break;
        }
        return React.DOM.input(attrs);
    },

    textAreaElement: function(context, data) {
        var attrs = {
            key: this.keyCount(),
            valueLink: context.linkState(data.name)
        }
        element = React.DOM.textarea(attrs);
        return element;
    },

    selectElement: function(context, data) {
        var options = null;
        var attrs = {
            key: this.keyCount(),
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
        }
        return React.DOM.select(attrs, options);
    },

    optionElement: function(data) {
        var options = new Array();
        for (var i = 0; i < data['choices'].length; i++) {
            options.push(React.DOM.option({key: i, value: data['choices'][i][0]}, data['choices'][i][1]));
        }
        return options;
    },

     buttons: function(context, data) {
        var buttons = [];
        buttons.push(React.DOM.button(
            {
                key: 'button-post',
                name: 'submit',
                title: 'Submit Data',
                onClick: context.handleSubmit},
            'Post'
            ));
        buttons.push(React.DOM.button(
            {
                key: 'button-cancel',
                name: 'cancel',
                title: 'Clear all fields',
                onClick: context.handleCancel},
            'Cancel'
            ));
        buttons.push(React.DOM.button(
            {
                key: 'button-delete',
                name: 'delete',
                title: 'Delete selected item',
                onClick: context.handleDelete},
            'Delete'
            ));
        return buttons;
    }
}

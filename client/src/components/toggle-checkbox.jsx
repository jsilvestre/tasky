import * as React from 'react/addons';

export default React.createClass({
    displayName: 'ToogleCheckbox',

    propTypes: {
        id: React.PropTypes.number.isRequired,
        isChecked: React.PropTypes.bool.isRequired,
        onToggle: React.PropTypes.func.isRequired,
    },

    render() {
        const id = `checkbox-${this.props.id}`;

        return (
            <div role="checkbox">
                <input checked={this.props.isChecked}
                    id={id}
                    onChange={this.props.onToggle}
                    type="checkbox" />
                <label htmlFor={id}></label>
            </div>
        );
    },
});

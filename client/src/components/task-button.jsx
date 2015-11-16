import styler from 'classnames';
import * as React from 'react/addons';

export default React.createClass({
    displayName: 'TaskButton',

    propTypes: {
        disabled: React.PropTypes.bool.isRequired,
        icon: React.PropTypes.string.isRequired,
        onSubmit: React.PropTypes.func,
    },

    render() {
        const classes = styler({'disabled': this.props.disabled});

        let onClick = null;
        if (this.props.disabled) {
            onClick = () => {};
        } else {
            onClick = this.props.onSubmit;
        }

        return (
            <button className={classes} onClick={onClick} role="button">
                <i className={`fa fa-${this.props.icon}`} />
            </button>
        );
    },
});

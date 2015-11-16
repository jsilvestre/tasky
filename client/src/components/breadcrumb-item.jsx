import styler from 'classnames';
import hasValue from '../utils/hasValue';
import React from 'react/addons';

export default React.createClass({
    displayName: 'BreadcrumbItem',

    propTypes: {
        key: React.PropTypes.string,
        label: React.PropTypes.string,
        removeHandler: React.PropTypes.func.isRequired,
        tag: React.PropTypes.object,
        toggleModeHandler: React.PropTypes.func,
        type: React.PropTypes.string.isRequired,
    },

    getInitialState() {
        return {removeHovered: false};
    },

    onClick(event) {
        event.stopPropagation();
        this.props.removeHandler();
    },

    onMouseOver() {
        this.setState({removeHovered: true});
    },

    onMouseOut() {
        this.setState({removeHovered: false});
    },

    render() {
        const isTag = this.props.type === 'tag';

        const isExcluded = hasValue(this.props.tag) &&
                           this.props.tag !== null &&
                           this.props.tag.isExcluded;

        const classes = styler({
            'breadcrumb-item': true,
            'excluded': isExcluded,
            'notice-delete-action': this.state.removeHovered,
        });

        let value;
        if (!isTag) {
            value = `"${this.props.label}"`;
        } else {
            value = this.props.tag.label;
        }

        return (
            <div className={classes}
                key={this.props.key}
                onClick={this.props.toggleModeHandler}>
                <span>{value}</span>
                <a onClick={this.onClick}
                    onMouseOut={this.onMouseOut}
                    onMouseOver={this.onMouseOver}>×</a>
            </div>
        );
    },
});

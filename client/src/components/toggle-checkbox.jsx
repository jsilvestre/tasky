"use strict";

import * as React from "react/addons";

export const ToggleCheckbox = React.createClass({
    displayName: "ToogleCheckbox",

    propTypes: {
        checked: React.PropTypes.bool.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    render() {
        const id = "checkbox-#{this.props.id}";

        return (
            <div role="checkbox">
                <input checked={this.props.checked}
                    id={id}
                    onChange={this.props.onChange}
                    type="checkbox" />
                <label htmlFor={id}></label>
            </div>
        );
    }
});

"use strict";

import * as React from "react/addons";
import * as styler from "classnames";

export const ProgressBar = React.createClass({
    displayName: "ProgressBar",

    propTypes: {
        tasks: React.PropTypes.array.isRequired,
        tasksDone: React.PropTypes.array.isRequired
    },

    getInitialState() {
        return {expanded: false};
    },

    onMouseOver() {
        this.setState({expanded: true});
    },

    onMouseOut() {
        this.setState({expanded: false});
    },

    render() {
        let progress =
            (this.props.tasksDone.length / this.props.tasks.length) * 100;
        progress = Math.round(progress, 1);
        const wrapperStyles = styler({"expanded": this.state.expanded});
        const fillerStyles = {width: `${progress}%`};
        return (
            <div classNames={wrapperStyles}
                 id="progressbar"
                 onMouseOut={this.onMouseOut} onMouseOver={this.onMouseOver}>
                <div style={fillerStyles}></div>
                <p>{progress}%</p>
            </div>
        );
    }
});

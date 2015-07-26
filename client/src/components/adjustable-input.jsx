"use strict";

import * as React from "react/addons";
import KeyboardKeys from "../constants/AppConstants";

export const AdjustableInput = React.createClass({
    displayName: "AdjustableInput",

    propTypes: {
        className: React.PropTypes.string.isRequired,
        id: React.PropTypes.string,
        onSubmitHandler: React.PropTypes.func.isRequired,
        placeholder: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return {width: 150, content: ""};
    },

    componentDidUpdate() {
        const node = this.refs["size-calculator"].getDOMNode();
        const rects = node.getClientRects()[0];
        if(rects !== null && rects !== void 0) {
            const width = node.getClientRects()[0].width;
            const notInitialState = this.state.content.length > 0
                              || this.state.width > 150;

            if(this.state.width !== width && notInitialState) {
                this.setState({width: width});
            }
        }
    },

    onBlur() {
        const node = this.refs.input.getDOMNode();
        if(node.value.length === 0) {
            this.setState({width: 150});
        }
    },

    onChange() {
        const node = this.refs.input.getDOMNode();
        this.setState({content: node.value});
    },

    onKeyUp(event) {
        const key = event.keyCode || event.charCode;

        if(key === KeyboardKeys.ENTER) {
            this.props.onSubmitHandler(this.state.content);
            this.setState({content: ""});
        }
    },

    render() {
        return (
            <span id={this.props.id}>
                <input className={this.props.className}
                    onBlur={this.onBlur}
                    onChange={this.onChange}
                    onKeyUp={this.onKeyUp}
                    placeholder={this.props.placeholder}
                    ref="input"
                    style="width: #{this.state.width}"
                    type="text"
                    value={this.state.content}/>
                <span className="size-calculator"
                    ref="size-calculator">{this.state.content}</span>
            </span>
        );
    }
});

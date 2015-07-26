"use strict";

import * as React from "react/addons";
import * as styler from "classnames";

import * as TaskActionCreator from "../actions/TaskActionCreator";
import * as TagActionCreator from "../actions/TagActionCreator";

export const ActionBar = React.createClass({

    displayName: "Actionbar",

    propTypes: {
        favoriteSearch: React.PropTypes.array.isRequired,
        selectedTags: React.PropTypes.array.isRequired,
        tasksDone: React.PropTypes.array.isRequired
    },

    onArchiveClicked() {
        TaskActionCreator.archiveTasks(this.props.tasksDone);
    },

    onFavoriteClicked() {
        TagActionCreator.markCurrentSearchAsFavorite();
    },

    render() {

        const archiveStyles = styler({
            "fa fa-archive": true,
            "disable": this.props.tasksDone.length === 0
        });

        const serializedSelectedTags = JSON.stringify(this.props.selectedTags);
        const serializedFavoriteSearch =
            JSON.stringify(this.props.favoriteSearch);

        const favoriteStyles = styler({
            "fa fa-star": true,
            "is-favorite": serializedFavoriteSearch === serializedSelectedTags
        });

        return (
            <div id="actions">
                t("actions headline")
                <i className={archiveStyles}
                    onClick={this.onArchivedClicked}
                    role="button"
                    title={t("archive button title")} />
                <i className="fa fa-bookmark disable"
                    role="button"
                    title={t("coming soon")} />
                <i className={favoriteStyles}
                    onClick={this.onFavoriteClicked}
                    role="button"
                    title={t("favorite button title")} />
            </div>
        );
    }
});

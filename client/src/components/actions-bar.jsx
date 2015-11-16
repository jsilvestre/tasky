import styler from 'classnames';
import * as React from 'react/addons';

import * as TaskActionCreator from '../actions/TaskActionCreator';
import * as TagActionCreator from '../actions/TagActionCreator';

export default React.createClass({

    displayName: 'Actionbar',

    propTypes: {
        dispatch: React.PropTypes.func.isRequired,
        favoriteSearch: React.PropTypes.array,
        selectedTags: React.PropTypes.array,
        tasksDone: React.PropTypes.array.isRequired,
    },

    onArchiveClicked() {
        const action = TaskActionCreator.archiveTasks(this.props.tasksDone);
        this.props.dispatch(action);
    },

    onFavoriteClicked() {
        const action = TagActionCreator.markCurrentSearchAsFavorite();
        this.props.dispatch(action);
    },

    render() {
        const archiveStyles = styler({
            'fa fa-archive': true,
            'disable': this.props.tasksDone.length === 0,
        });

        const serializedSelectedTags = JSON.stringify(this.props.selectedTags);
        const serializedFavoriteSearch =
            JSON.stringify(this.props.favoriteSearch);

        const favoriteStyles = styler({
            'fa fa-star': true,
            'is-favorite': serializedFavoriteSearch === serializedSelectedTags,
        });

        return (
            <div id="actions">
                {t('actions headline')}
                <i className={archiveStyles}
                    onClick={this.onArchiveClicked}
                    role="button"
                    title={t('archive button title')} />
                <i className="fa fa-bookmark disable"
                    role="button"
                    title={t('coming soon')} />
                <i className={favoriteStyles}
                    onClick={this.onFavoriteClicked}
                    role="button"
                    title={t('favorite button title')} />
            </div>
        );
    },
});

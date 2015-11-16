import request from 'superagent';

export function create(rawTask, callback) {
    request.post('tasks')
        .send(rawTask)
        .set('Accept', 'application/json')
        .end((err, res) => {
            if (res.ok) {
                callback(null, res.body);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function update(taskID, attributes, callback) {
    request.put(`tasks/${taskID}`)
        .send(attributes)
        .set('Accept', 'application/json')
        .end((err, res) => {
            if (res.ok) {
                callback(null, res.body);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function remove(taskID, callback) {
    request.del(`tasks/${taskID}`)
        .set('Accept', 'application/json')
        .end((err, res) => {
            if (res.ok) {
                callback(null);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function reindex(callback) {
    request.post('tasks/reindex')
        .end((err, res) => {
            if (res.ok) {
                callback(null, res.body);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function markTagAsFavorite(label, callback) {
    request.post('tags')
        .send({label: label})
        .end((err, res) => {
            if (res.ok) {
                callback(null);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function unmarkTagAsFavorite(label, callback) {
    request.del('tags')
        .send({label: label})
        .end((err, res) => {
            if (res.ok) {
                callback(null);
            } else {
                callback(`Something went wrong -- ${res.body}`);
            }
        });
}

export function markSearchAsFavorite(search) {
    const json = JSON.stringify(search);
    localStorage.setItem('tasky.favorite_search', json);
}

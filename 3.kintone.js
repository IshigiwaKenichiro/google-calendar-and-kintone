
const accessor = {
    updateRecords(updaters) {
        for (let i = 0; i < updaters.length; i += 100) {
            const chunk = updaters.filter((item, idx) => i <= idx && idx < i + 100);

            const ids = accessor.fetch(`${env.kintone.baseUrl}/k/v1/records.json`, 'PUT', {
                payload: {
                    app: env.kintone.appId,
                    records: chunk
                }
            })
        }
    },
    createRecords(creaters) {
        for (let i = 0; i < creaters.length; i += 100) {
            const chunk = creaters.filter((item, idx) => i <= idx && idx < i + 100);

            const ids = accessor.fetch(`${env.kintone.baseUrl}/k/v1/records.json`, 'POST', {
                payload: {
                    app: env.kintone.appId,
                    records: chunk
                }
            })
        }
    },
    deleteRecords(ids) {
        const ret = {
            errors: []
        }
        try {
            for (let i = 0; i < ids.length; i += 100) {
                const chunk = ids.filter((item, idx) => i <= idx && idx < i + 100);

                accessor.fetch(`${env.kintone.baseUrl}/k/v1/records.json`, 'DELETE', {
                    payload: {
                        app: env.kintone.appId,
                        ids : chunk
                    }
                });
            }

        } catch (e) {
            libs.log(e);
            ret.errors.push('データの操作に失敗しました。');
        }

        return ret;
    },

    getLastUpdated() {
        const ret = {
            errors: [], lastUpdated: null
        }
        try {
            const json = accessor.fetch(`${env.kintone.baseUrl}/k/v1/records.json`, 'GET', {
                payload: {
                    app: env.kintone.appId,
                    query: `order by 連携日時 desc limit 1 `
                }
            })

            const { records } = json;

            if (0 == records.length) return ret;

            const batchUpdated = records[0]["連携日時"].value;

            if (null == batchUpdated) return ret;

            ret.lastUpdated = new Date(batchUpdated);

        } catch (e) {
            libs.log(e);
            ret.errors.push('レコード取得に失敗しました。');
        }

        return ret;
    },
    /**
     * 
     * @param {{
     *      start : Date;
     *      end : Date;
     *      startField : string;
     *      endField: string;
     * }} param0 
     */
    getRecordsOnPeriod({ start, end, startField, endField }) {
        const query = `${startField} >= "${start.toISOString()}" and ${endField} <= "${end.toISOString()}"`

        console.log({ query })

        return this.getAllRecords(env.kintone.appId, query);
    },


    getAllRecords(appId, query = undefined) {
        const ret = {
            errors: [], records: []
        }
        try {
            const cursor = accessor.fetch(`${env.kintone.baseUrl}/k/v1/records/cursor.json`, 'POST', {
                payload: {
                    app: appId,
                    query,
                    size: 500
                }
            });
            const getRecords = () => {
                const { records } = accessor.fetch(`${env.kintone.baseUrl}/k/v1/records/cursor.json`, "GET", {
                    payload: cursor
                });
                ret.records.push(...records);

                if (records.length == 500) {
                    getRecords();
                }
            }

            getRecords();
        } catch (e) {
            libs.log(e);
            ret.errors.push('データの取得に失敗しました。');
        }

        return ret;
    },
    fetch(url, method, options) {
        try {
            const resp = UrlFetchApp.fetch(
                url, {
                ...options,
                method: 'POST',
                headers: {
                    "X-Cybozu-API-Token": env.kintone.apiToken,
                    'authentication': `Basic ${Utilities.base64Encode(`${env.kintone.basicUsername}:${env.kintone.basicPassword}`)}`,
                    'x-http-method-override': method,
                    "content-type": 'application/json'
                },
                payload: JSON.stringify(options.payload)
            })

            const code = resp.getResponseCode();
            const text = resp.getContentText();

            if (200 != code) throw new Error(JSON.stringify({ code, text }));

            return JSON.parse(text);

        } catch (e) {
            libs.log(e);
            libs.log({ url, method, options });
            throw e;
        }
    }

}
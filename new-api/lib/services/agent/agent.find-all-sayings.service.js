import {
    MODEL_AGENT,
    MODEL_CATEGORY,
    MODEL_SAYING
} from '../../../util/constants';
import RedisErrorHandler from '../../errors/redis.error-handler';

module.exports = async function ({ id, loadCategoryId, skip, limit, direction, field }) {

    const { globalService } = await this.server.services();
    const { redis } = this.server.app;

    try {
        const AgentModel = await globalService.findById({ id, model: MODEL_AGENT, returnModel: true });
        const sayingsIds = await AgentModel.getAll(MODEL_SAYING, MODEL_SAYING);
        const SayingModel = await redis.factory(MODEL_SAYING);
        const totalCount = sayingsIds.length;

        const SayingModels = await SayingModel.findAllByIds({ ids: sayingsIds, skip, limit, direction, field });
        const data = await Promise.all(SayingModels.map(async (sayingModel) => {

            const saying = await sayingModel.allProperties();
            if (loadCategoryId) {
                const categoriesId = await sayingModel.getAll(MODEL_CATEGORY, MODEL_CATEGORY);
                return { ...saying, ...{ category: categoriesId[0] } };
            }
            return saying;
        }));

        return { data, totalCount };
    }
    catch (error) {
        throw RedisErrorHandler({ error });
    }
};

import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toTheString } from '../../utils/to-string';
import { IMarkdownParsedObjects, parseMarkdownForObjects } from '../../utils/parse-markdown-for-objects';

type IParams = {
    text: string;
};

type IResult = IMarkdownParsedObjects;

export default class InternalParseMarkdown extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        const text = toTheString(params.text, '');

        return { text };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        return parseMarkdownForObjects(params.text);
    }
}

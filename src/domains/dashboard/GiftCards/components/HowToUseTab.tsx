import { Flex } from 'antd';
import { Content } from 'antd/es/layout/layout';

type Props = {
    text?: string;
};

function HowToUseTab({ text }: Props) {
    return (
        <Content>
            <Flex>
                <div
                    className="text-neutral-500 text-xs font-normal leading-loose tracking-wider gift-card-html-content"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                />
            </Flex>
        </Content>
    );
}

export default HowToUseTab;

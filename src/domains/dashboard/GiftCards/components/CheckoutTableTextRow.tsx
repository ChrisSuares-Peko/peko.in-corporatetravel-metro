import { Typography } from 'antd';

type Props = {
    text: string;
};

const CheckoutTableTextRow = ({ text }: Props) => (
    <Typography.Text className="text-zinc-900 md:text-sm text-xs font-normal">
        {text}
    </Typography.Text>
);

export default CheckoutTableTextRow;

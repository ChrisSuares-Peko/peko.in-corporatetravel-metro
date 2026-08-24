import { Col, Image, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';

import defaultImage from '../../../Assets/defaultImage.jpg';

// interface details {
//     image?: any;
// }
const ViewHotel = ({ image }: any) => {
    const firstImage = image?.[0];
    const secondImage = image?.[1];
    const ThirdImage = image?.[2];
    const fourthImage = image?.[3];
    const lastImage = image?.[4];

    return (
        <Content>
            <Image.PreviewGroup>
                <Row gutter={5}>
                    <Col span={14}>
                        <Image
                            height={333}
                            // height='100%'
                            width="100%"
                            src={
                                firstImage !== '' && firstImage !== undefined
                                    ? firstImage
                                    : defaultImage
                            }
                            style={{ borderRadius: ' 0.625rem 0 0 0.625rem ', objectFit: 'cover' }}
                            className="object-contain "
                        />
                    </Col>
                    <Col span={10}>
                        <Row
                            gutter={5}
                            //  className="h-1/2"
                        >
                            <Col span={12}>
                                <Image
                                    height={164}
                                    // height='100%'
                                    width="100%"
                                    src={
                                        // eslint-disable-next-line no-nested-ternary
                                        secondImage &&
                                        secondImage !== undefined &&
                                        secondImage !== ''
                                            ? secondImage
                                            : firstImage !== '' && firstImage !== undefined
                                              ? firstImage
                                              : defaultImage
                                    }
                                    style={{ objectFit: 'cover' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Image
                                    height={164}
                                    // height='100%'
                                    width="100%"
                                    src={
                                        // eslint-disable-next-line no-nested-ternary
                                        ThirdImage && ThirdImage !== undefined && ThirdImage !== ''
                                            ? ThirdImage
                                            : firstImage !== '' && firstImage !== undefined
                                              ? firstImage
                                              : defaultImage
                                    }
                                    style={{ borderRadius: '0 0.625rem 0 0', objectFit: 'cover' }}
                                />
                            </Col>
                        </Row>

                        <Row
                            gutter={5}
                            // className="h-1/2 mt-1"
                        >
                            <Col span={12}>
                                <Image
                                    height={164}
                                    // height='100%'
                                    width="100%"
                                    src={
                                        // eslint-disable-next-line no-nested-ternary
                                        fourthImage &&
                                        fourthImage !== undefined &&
                                        fourthImage !== ''
                                            ? fourthImage
                                            : firstImage !== '' && firstImage !== undefined
                                              ? firstImage
                                              : defaultImage
                                    }
                                    style={{ objectFit: 'cover' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Image
                                    height={164}
                                    // height='100%'
                                    src={
                                        // eslint-disable-next-line no-nested-ternary
                                        lastImage && lastImage !== undefined && lastImage !== ''
                                            ? lastImage
                                            : firstImage !== '' && firstImage !== undefined
                                              ? firstImage
                                              : defaultImage
                                    }
                                    width="100%"
                                    style={{ borderRadius: '0 0 0.625rem 0', objectFit: 'cover' }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Image.PreviewGroup>
        </Content>
    );
};

export default ViewHotel;

import { JSXElementConstructor, ReactElement } from 'react';

import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { ReactSVG } from 'react-svg';

export const NavIcon = (
    icon: any,
    isActive: boolean,
    isStrokeSvg?: boolean
): ReactElement<CustomIconComponentProps, string | JSXElementConstructor<any>> => (
    <Icon
        component={() => (
            <div className="w-4 h-4">
                <ReactSVG src={icon} />
            </div>
        )}
        className={
            // eslint-disable-next-line no-nested-ternary
            isActive && isStrokeSvg ? 'svg-primary-stroke' : isActive ? 'svg-primary' : ''
        }
    />
);

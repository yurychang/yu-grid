import classNames from 'classnames';

const styledEl =
    (Component) =>
    (strs, ...params) =>
    ({ className, ...props }) => {
        return (
            <Component
                className={classNames(strs, params, className)}
                {...props}
            />
        );
    };

const elList = ['div', 'header'];
elList.forEach((el) => (styledEl[el] = styledEl(el)));

export default styledEl;

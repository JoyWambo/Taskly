import React, { useId } from 'react';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import { CaretSortIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { FixedSizeList as List } from 'react-window';
import { matchSorter } from 'match-sorter';
import { cn } from '@/lib/utils';

const styles = {
  control: {
    base: 'flex min-h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-none transition-colors hover:cursor-pointer',
    focus: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    disabled: 'cursor-not-allowed opacity-50',
    error: 'border-destructive',
    success: 'border-primary',
  },
  placeholder: 'text-sm text-muted-foreground',
  indicatorsContainer: 'gap-1',
  clearIndicator: 'p-1 rounded-md',
  dropdownIndicator: 'p-1 rounded-md',
  menu: 'p-1 mt-2 border bg-popover shadow-md rounded-md text-popover-foreground',
  option: {
    base: 'hover:cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-1.5 rounded-sm text-sm',
    focus: 'bg-accent text-accent-foreground',
    disabled: 'pointer-events-none opacity-50',
  },
  noOptionsMessage:
    'text-accent-foreground p-2 bg-accent border border-dashed border-border rounded-sm',
};

const createClassNames = (fieldState = {}) => ({
  control: (state) =>
    cn(
      styles.control.base,
      state.isDisabled && styles.control.disabled,
      state.isFocused && styles.control.focus,
      fieldState?.error && styles.control.error,
      !fieldState?.error && state.selectProps.value && styles.control.success
    ),
  placeholder: () => styles.placeholder,
  indicatorsContainer: () => styles.indicatorsContainer,
  clearIndicator: () => styles.clearIndicator,
  dropdownIndicator: () => styles.dropdownIndicator,
  menu: () => styles.menu,
  option: (state) =>
    cn(
      styles.option.base,
      state.isFocused && styles.option.focus,
      state.isDisabled && styles.option.disabled
    ),
  noOptionsMessage: () => styles.noOptionsMessage,
});

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <CaretSortIcon className='size-4 opacity-50' />
  </components.DropdownIndicator>
);

const ClearIndicator = (props) => (
  <components.ClearIndicator {...props}>
    <Cross2Icon className='size-3.5 opacity-50' />
  </components.ClearIndicator>
);

const Option = (props) => (
  <components.Option {...props}>
    <div className='flex items-center justify-between'>
      <span className={props.isSelected ? 'text-primary font-medium' : ''}>
        {props.data.label}
      </span>
      {props.isSelected && <CheckIcon className='ml-auto size-4 text-primary' />}
    </div>
  </components.Option>
);

const MenuList = (props) => {
  const { children, maxHeight } = props;
  const items = React.Children.toArray(children);
  if (!items.length) {
    return <components.MenuList {...props} />;
  }

  const height = Math.min(items.length * 36, maxHeight);

  return (
    <List height={height} itemCount={items.length} itemSize={36} width='100%'>
      {({ index, style }) => <div style={style}>{items[index]}</div>}
    </List>
  );
};

const defaultStyles = {
  input: (base) => ({
    ...base,
    'input:focus': { boxShadow: 'none' },
  }),
  control: (base) => ({
    ...base,
    transition: 'none',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 20,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
  }),
};

const SelectInput = React.forwardRef(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      isClearable = true,
      fieldState = {},
      ...props
    },
    ref
  ) => {
    const instanceId = useId();
    const sortedOptions =
      options && options.length > 0
        ? matchSorter(options, {
            keys: ['label'],
            threshold: matchSorter.rankings.STARTS_WITH,
          })
        : options;

    const loadOptions = (inputValue, callback) => {
      const filtered = sortedOptions.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      callback(filtered);
    };

    return (
      <AsyncSelect
        ref={ref}
        instanceId={instanceId}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        cacheOptions
        defaultOptions={sortedOptions}
        loadOptions={loadOptions}
        unstyled
        isClearable={isClearable}
        classNames={createClassNames(fieldState)}
        styles={defaultStyles}
        components={{
          DropdownIndicator,
          ClearIndicator,
          Option,
          MenuList,
        }}
        {...props}
      />
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;

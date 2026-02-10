export default function Input({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#543310] mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-white
                   border border-[#74512D]/20
                   text-sm text-[#543310]
                   outline-none focus:border-[#74512D]/40"
      />
    </div>
  );
}

import type { Config } from '@measured/puck';
import { TimetableBlock, TimetableBlockProps } from './components/storefront/blocks/TimetableBlock';

type Props = {
  HeadingBlock: { title: string };
  TimetableBlock: TimetableBlockProps;
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: 'text' },
      },
      defaultProps: {
        title: 'Heading',
      },
      render: ({ title }) => (
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
        </div>
      ),
    },
    TimetableBlock: {
      label: 'Timetables',
      fields: {
        title: { type: 'text' },
        description: { type: 'textarea' },
        view: {
          type: 'radio',
          options: [{ label: 'Card', value: 'card' }, { label: 'Grid', value: 'grid' }],
        },
        cardStyle: {
          type: 'select',
          options: [{ label: 'Style 1', value: 'style-1' }, { label: 'Style 2', value: 'style-2' }],
        },
        showFields: {
          type: 'custom',
          render: ({ value = { title: true, file: true, branch: true, semester: true, download: true, year: true }, onChange }) => {
            const toggle = (field: string) => onChange({ ...value, [field]: !value[field] });
            const fields = [
              { key: 'title', label: 'Title' },
              { key: 'file', label: 'File' },
              { key: 'branch', label: 'Branch' },
              { key: 'semester', label: 'Semester' },
              { key: 'download', label: 'Download button' },
              { key: 'year', label: 'Year' },
            ];
            
            return (
              <div className="flex flex-col gap-2 p-1">
                {fields.map(f => (
                  <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={value[f.key] !== false} 
                      onChange={() => toggle(f.key)} 
                    />
                    <span className="text-gray-700">{f.label}</span>
                  </label>
                ))}
              </div>
            );
          }
        }
      },
      defaultProps: {
        title: 'Academic Timetables',
        description: 'Download the latest timetables for your academic year.',
        view: 'card',
        cardStyle: 'style-1',
        showFields: { title: true, file: true, branch: true, semester: true, download: true, year: true },
      },
      render: ({ title, description, view, cardStyle, showFields }) => (
        <TimetableBlock 
          title={title} 
          description={description}
          view={view}
          cardStyle={cardStyle}
          showFields={showFields}
        />
      ),
    },
  },
};

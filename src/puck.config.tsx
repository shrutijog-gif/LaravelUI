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
      fields: {
        title: { type: 'text' },
        description: { type: 'textarea' },
        yearFilter: { 
          type: 'text',
          label: 'Year Filter (Leave empty to show all)' 
        },
      },
      defaultProps: {
        title: 'Academic Timetables',
        description: 'Download the latest timetables for your academic year.',
        yearFilter: '',
      },
      render: ({ title, description, yearFilter }) => (
        <TimetableBlock title={title} description={description} yearFilter={yearFilter} />
      ),
    },
  },
};

import { useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { hasWritePermission, LayerType } from '../../../utils/gis';
import RoundedCheck from '../../atomos/roundedCheck';
import InfoTypeItem from '../../molecules/infoTypeItem';
import { InfoTypeSelectorProps } from './interface';

interface InfoType {
  value: LayerType;
  alt: string;
  icon: string;
  label: string;
  resolution: number[];
}

const InfoTypeSelector: React.FunctionComponent<InfoTypeSelectorProps> = ({
  onChanged,
  defaultValue,
}) => {
  const { currentUser } = useCurrentUser();
  const [options, setOptions] = useState<InfoType[] | null>(null);
  const [selected, setSelected] = useState<string>(defaultValue == null ? '' : defaultValue);

  if (currentUser != null && options == null) {
    const optionBase: InfoType[] = [
      {
        value: 'boar',
        alt: 'いのししアイコン',
        icon: '/static/images/icons/boar.svg',
        label: '捕獲情報',
        resolution: [46, 32],
      },
      {
        value: 'trap',
        alt: 'わなアイコン',
        icon: '/static/images/icons/trap.svg',
        label: 'わな情報',
        resolution: [32, 32],
      },
      {
        value: 'vaccine',
        alt: 'ワクチンアイコン',
        icon: '/static/images/icons/vaccine.svg',
        label: 'ワクチン情報',
        resolution: [32, 32],
      },
      {
        value: 'youton',
        alt: '養豚場アイコン',
        icon: '/static/images/icons/youton.png',
        label: '養豚場情報',
        resolution: [32, 32],
      },
      {
        value: 'butanetsu',
        alt: '豚熱確認アイコン',
        icon: '/static/images/icons/butanetsu.png',
        label: '豚熱陽性確認情報',
        resolution: [32, 32],
      },
      {
        value: 'report',
        alt: '作業日報アイコン',
        icon: '/static/images/icons/report.png',
        label: '作業日報',
        resolution: [32, 32],
      },
    ];
    setOptions(optionBase.filter((f) => hasWritePermission(f.value, currentUser)));
  }

  return (
    <form>
      {options == null ? (
        <></>
      ) : (
        options.map((o, i) => (
          <div key={o.alt} className={'mb-10 h-9 w-full ' + (i != 0 ? 'mt-5' : 'mt-10')}>
            <input
              id={`radio-${i + 1}`}
              type='radio'
              name='radio'
              onChange={() => {
                setSelected(o.value);
                onChanged(o.value);
              }}
              className='hidden'
            />
            <label htmlFor={`radio-${i + 1}`} className='mx-5 flex items-center'>
              <div className='mr-3'>
                <RoundedCheck checked={selected == o.value} />
              </div>
              <InfoTypeItem
                src={o.icon}
                alt={o.alt}
                text={o.label}
                width={o.resolution[0]}
                height={o.resolution[1]}
                selected={selected == o.value}
              />
            </label>
          </div>
        ))
      )}
    </form>
  );
};

export default InfoTypeSelector;

// @flow
// vendor
import React, { Component } from 'react';
// data
import chartConfig from './ChartConfig';
// css
import './HorizontalBar.scss';

type Props = {
  fileTypeDistribution: Array<string>,
}


/**
* @param {Array<string>} fileTypeDistribution
* gets d3 style object
* @return {Object}
*/
const getData = (fileTypeDistribution) => {
  let totalReturnedValues = 0;
  const data = {
    name: 'files',
    children: fileTypeDistribution.map((fileData) => {
      const fileDataArray = fileData.split('|');
      totalReturnedValues += parseFloat(fileDataArray[0]);
      return {
        name: fileDataArray[1],
        value: parseFloat(fileDataArray[0]),
      };
    }),
  };

  if ((1 - totalReturnedValues) > 0) {
    data.children.push({
      name: (totalReturnedValues === 0)
        ? 'Empty'
        : 'Other',
      value: 1 - totalReturnedValues,
    });
  }
  return data;
};

class HorizontalBar extends Component<Props> {
  static color = [];

  render() {
    const { fileTypeDistribution } = this.props;
    const data = getData(fileTypeDistribution.slice(0, 5));
    return (
      <div className="HorizontalBar flex flex-1 justify--left">
        {
          data.children.map((node, index) => {
            const indexMod = index % 6;
            const { name } = node;
            const background = name === 'Empty'
              ? '#676767'
              : chartConfig.backgrounds[index];
            const nodeStyle = {
              background,
              width: `${(node.value * 100)}%`,
              height: '100%',
              color: '#fff',
            };

            const value = Math.round(node.value * 100, 0);
            const text = (name !== 'Empty')
              ? `${name} ${value}%`
              : name;

            return (
              <div
                key={`${name}${indexMod}`}
                className="HorizontalBar__block flex justify--center align-items--center"
                style={nodeStyle}
              >
                <div className="Treemap__text">
                  {text}
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default HorizontalBar;

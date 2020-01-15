// vendor
import React, { PureComponent } from 'react';
// components
import SecretsTable from './SecretsTable';
import AddSecret from './AddSecret';
// assets
import './SecretsCard.scss';

type Props = {
  name: string,
  owner: string,
  relay: Object,
  secretsMutations: Object,
  secrets: Object,
}

class PackageCard extends PureComponent<Props> {
  render() {
    const {
      name,
      owner,
      relay,
      secretsMutations,
      secrets,
    } = this.props;
    return (
      <div className="SecretCard Card Card--auto Card--no-hover column-1-span-12 relative">
        <AddSecret
          secretsMutations={secretsMutations}
          relay={relay}
          name={name}
          owner={owner}
        />
        <SecretsTable
          secretsMutations={secretsMutations}
          secrets={secrets}
          relay={relay}
          name={name}
          owner={owner}
        />
      </div>
    );
  }
}

export default PackageCard;

import React from 'react';
import Helmet from 'react-helmet';
import {
  Col,
  Row,
} from 'react-materialize';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import ActionButton from '../../components/ActionButton/index';
import Content from '../../components/Content';
import ContentHeader from '../../components/ContentHeader';
import DeleteModal from '../../components/DeleteModal';
import EntitiesTable from '../../components/EntitiesTable/index';
import Form from '../../components/Form';
import Header from '../../components/Header';
import Preloader from '../../components/Preloader';

import {
  deleteEntity,
  loadAgentEntities,
  resetAgentDomains,
} from '../../containers/App/actions';
import {
  makeSelectAgentEntities,
  makeSelectCurrentAgent,
  makeSelectEntity,
  makeSelectError,
  makeSelectLoading,
} from '../../containers/App/selectors';
import messages from './messages';

export class EntityListPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();
    this.onCreateAction = this.onCreateAction.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.onDeletePrompt = this.onDeletePrompt.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteDismiss = this.onDeleteDismiss.bind(this);
  }

  state = {
    deleteModalOpen: false,
    entityToDelete: undefined,
  };

  componentWillMount() {
    const { currentAgent } = this.props;
    if (currentAgent) {
      this.props.onComponentWillUpdate(currentAgent);
    }
  }

  componentWillUpdate(nextProps) {
    const { currentAgent } = nextProps;
    if (currentAgent !== this.props.currentAgent) {
      this.props.onComponentWillUpdate(currentAgent);
    }
  }

  onCreateAction() {
    this.props.onChangeUrl('/entities/create');
  }

  onDeletePrompt(entity) {
    this.setState({
      deleteModalOpen: true,
      entityToDelete: entity,
    });
  }

  onDelete() {
    this.props.onDeleteDomain(this.state.entityToDelete);
    this.onDeleteDismiss();
  }

  onDeleteDismiss() {
    this.setState({
      deleteModalOpen: false,
      entityToDelete: undefined,
    });
  }

  renderMenu() {
    return [{
      label: 'Delete',
      action: (entity) => this.onDeletePrompt(entity),
    }];
  }

  render() {
    const { loading, error, agentEntities, currentAgent } = this.props;
    const entityProps = {
      loading,
      error,
      agentEntities,
    };

    let breadcrumbs = [];
    if (currentAgent) {
      breadcrumbs = [{ link: `/agent/${currentAgent.id}`, label: `Agent: ${currentAgent.agentName}` }, { label: 'Entities' }];
    } else {
      breadcrumbs = [{ label: 'Entities' }];
    }

    return (
      <div>
        <Col style={{ zIndex: 2, position: 'fixed', top: '50%', left: '45%' }} s={12}>
          {entityProps.loading ? <Preloader color={'#00ca9f'} size={'big'} /> : null}
        </Col>
        <Helmet
          title="Agent Entities"
          meta={[
            { name: 'description', content: 'Create a entity for your agent' },
          ]}
        />
        <Header breadcrumbs={breadcrumbs} />
        <Content>
          <ContentHeader title={messages.entityListTitle} subTitle={messages.entityListDescription} />
          <Form>
            <Row>
              <EntitiesTable
                data={agentEntities || []}
                menu={this.renderMenu()}
                onCellChange={() => {
                }}
              />
            </Row>
            <ActionButton label={messages.actionButton} onClick={this.onCreateAction} />
            <Row>
              <p>
                {JSON.stringify(entityProps)}
              </p>
            </Row>
          </Form>

        </Content>
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={this.onDelete}
          onDismiss={this.onDeleteDismiss}
        />
      </div>
    );
  }
}

EntityListPage.propTypes = {
  loading: React.PropTypes.bool,
  error: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  onComponentWillUpdate: React.PropTypes.func,
  onChangeUrl: React.PropTypes.func,
  onDeleteDomain: React.PropTypes.func,
  agentEntities: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  currentAgent: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
};

export function mapDispatchToProps(dispatch) {
  return {
    onComponentWillUpdate: (agent) => agent ? dispatch(loadAgentEntities(agent.id)) : dispatch(resetAgentDomains()), // TODO: Reset agent entities
    onChangeUrl: (url) => dispatch(push(url)),
    onDeleteDomain: (entity) => dispatch(deleteEntity(entity.id)),
  };
}

const mapStateToProps = createStructuredSelector({
  entity: makeSelectEntity(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
  agentEntities: makeSelectAgentEntities(),
  currentAgent: makeSelectCurrentAgent(),
});

export default connect(mapStateToProps, mapDispatchToProps)(EntityListPage);

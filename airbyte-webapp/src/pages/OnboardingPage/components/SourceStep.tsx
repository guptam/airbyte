import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import ContentCard from "components/ContentCard";
import ServiceForm from "components/ServiceForm";
import { AnalyticsService } from "core/analytics/AnalyticsService";

import { useSourceDefinitionSpecificationLoad } from "components/hooks/services/useSourceHook";

import usePrepareDropdownLists from "./usePrepareDropdownLists";
import { createFormErrorMessage } from "utils/errorStatusMessage";
import { JobInfo } from "core/resources/Scheduler";
import { JobsLogItem } from "components/JobItem";
import SkipOnboardingButton from "./SkipOnboardingButton";
import { ConnectionConfiguration } from "core/domain/connection";

type IProps = {
  onSubmit: (values: {
    name: string;
    serviceType: string;
    sourceDefinitionId?: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => void;
  dropDownData: { value: string; text: string; icon: string }[];
  hasSuccess?: boolean;
  error?: null | { message?: string; status?: number };
  jobInfo?: JobInfo;
  afterSelectConnector?: () => void;
};

const SourceStep: React.FC<IProps> = ({
  onSubmit,
  dropDownData,
  hasSuccess,
  error,
  jobInfo,
  afterSelectConnector,
}) => {
  const [sourceDefinitionId, setSourceDefinitionId] = useState("");
  const {
    sourceDefinitionSpecification,
    isLoading,
  } = useSourceDefinitionSpecificationLoad(sourceDefinitionId);

  const { getSourceDefinitionById } = usePrepareDropdownLists();

  const onDropDownSelect = (sourceId: string) => {
    const sourceDefinition = getSourceDefinitionById(sourceId);

    AnalyticsService.track("New Source - Action", {
      action: "Select a connector",
      connector_source: sourceDefinition?.name,
      connector_source_id: sourceDefinition?.sourceDefinitionId,
    });

    if (afterSelectConnector) {
      afterSelectConnector();
    }

    setSourceDefinitionId(sourceId);
  };

  const onSubmitForm = async (values: { name: string; serviceType: string }) =>
    onSubmit({
      ...values,
      sourceDefinitionId: sourceDefinitionSpecification?.sourceDefinitionId,
    });

  const errorMessage = error ? createFormErrorMessage(error) : "";

  return (
    <ContentCard title={<FormattedMessage id="onboarding.sourceSetUp" />}>
      <ServiceForm
        additionBottomControls={
          <SkipOnboardingButton step="source connection" />
        }
        allowChangeConnector
        onDropDownSelect={onDropDownSelect}
        onSubmit={onSubmitForm}
        formType="source"
        availableServices={dropDownData}
        hasSuccess={hasSuccess}
        errorMessage={errorMessage}
        specifications={sourceDefinitionSpecification?.connectionSpecification}
        documentationUrl={sourceDefinitionSpecification?.documentationUrl}
        isLoading={isLoading}
      />
      <JobsLogItem jobInfo={jobInfo} />
    </ContentCard>
  );
};

export default SourceStep;

import { useState } from 'react'
import type { PackageSelection, TripPlanResult } from '../../api/types'
import { usePackageSelection } from './usePackageSelection'
import { PackageItemCard } from './PackageItemCard'
import { FlightLegCard } from './FlightLegCard'
import { FlightLegList } from './FlightLegList'
import { HotelCard } from './HotelCard'
import { HotelsList } from './HotelsList'
import { SelectionModal } from './SelectionModal'
import { TripSummaryBar } from './TripSummaryBar'

interface PackageViewProps {
  result: TripPlanResult
  pkg: PackageSelection
}

type OpenModal = 'outbound' | 'return' | 'hotel' | null

export function PackageView({ result, pkg }: PackageViewProps) {
  const selection = usePackageSelection(result, pkg)
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const isAi = pkg.source === 'llm'

  const badgeLabel = selection.isCustomized ? 'Customized' : isAi ? 'AI Recommended' : 'Deterministic Recommendation'
  const badgeClass = selection.isCustomized
    ? 'package-badge-customized'
    : isAi
      ? 'package-badge-ai'
      : 'package-badge-fallback'
  const titleLabel = selection.isCustomized ? 'Customized Package' : isAi ? 'AI Recommended Package' : 'Recommended Package'

  const explanationHeading = isAi ? 'AI Explanation' : 'Recommendation Reasoning'
  const explanationSubtitle = isAi
    ? "This explains the original AI-recommended package, not any changes you've made below."
    : "This explains the original deterministic recommendation, not any changes you've made below."

  function openOutboundModal() {
    setPendingId(selection.current.outboundId)
    setOpenModal('outbound')
  }

  function openReturnModal() {
    setPendingId(selection.current.returnId)
    setOpenModal('return')
  }

  function openHotelModal() {
    setPendingId(selection.current.hotelId)
    setOpenModal('hotel')
  }

  function cancelModal() {
    setOpenModal(null)
    setPendingId(null)
  }

  function confirmModal() {
    if (pendingId === null || openModal === null) {
      cancelModal()
      return
    }

    if (openModal === 'outbound') selection.setOutbound(pendingId)
    if (openModal === 'return') selection.setReturn(pendingId)
    if (openModal === 'hotel') selection.setHotel(pendingId)

    cancelModal()
  }

  return (
    <div className="package-view">
      <div className="package-header">
        <h1>{titleLabel}</h1>
        <span className={`package-badge ${badgeClass}`}>{badgeLabel}</span>
      </div>

      <div className="package-items">
        <PackageItemCard
          label="Recommended outbound flight"
          changeLabel="Change outbound flight"
          isChanged={selection.changed.outbound}
          onChangeClick={openOutboundModal}
        >
          {selection.selectedOutboundFlight && <FlightLegCard leg={selection.selectedOutboundFlight} />}
        </PackageItemCard>

        <PackageItemCard
          label="Recommended return flight"
          changeLabel="Change return flight"
          isChanged={selection.changed.return}
          onChangeClick={openReturnModal}
        >
          {selection.selectedReturnFlight && <FlightLegCard leg={selection.selectedReturnFlight} />}
        </PackageItemCard>

        <PackageItemCard
          label="Recommended hotel"
          changeLabel="Change hotel"
          isChanged={selection.changed.hotel}
          onChangeClick={openHotelModal}
        >
          {selection.selectedHotel && <HotelCard hotel={selection.selectedHotel} />}
        </PackageItemCard>
      </div>

      <div className="package-explanation">
        <h2>{explanationHeading}</h2>
        <p className="package-explanation-subtitle">{explanationSubtitle}</p>
        <p className="package-explanation-summary">{pkg.summary}</p>
        <p>{pkg.reasoning}</p>

        {pkg.advantages.length > 0 && (
          <div className="package-explanation-list">
            <h3>Key advantages</h3>
            <ul>
              {pkg.advantages.map((advantage) => (
                <li key={advantage}>{advantage}</li>
              ))}
            </ul>
          </div>
        )}

        {pkg.tradeoffs.length > 0 && (
          <div className="package-explanation-list">
            <h3>Trade-offs</h3>
            <ul>
              {pkg.tradeoffs.map((tradeoff) => (
                <li key={tradeoff}>{tradeoff}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="package-explanation-recommendation">{pkg.recommendation}</p>
      </div>

      {selection.isCustomized && (
        <button type="button" className="secondary-button package-restore-button" onClick={selection.restore}>
          Restore AI recommendation
        </button>
      )}

      <TripSummaryBar result={result} selection={selection.current} />

      {openModal === 'outbound' && (
        <SelectionModal title="Change outbound flight" onCancel={cancelModal} onConfirm={confirmModal} confirmDisabled={!pendingId}>
          <FlightLegList
            title={`${result.flights.outbound.length} outbound flights available`}
            groupName="outbound-edit"
            legs={result.flights.outbound}
            selectedId={pendingId}
            onSelect={setPendingId}
          />
        </SelectionModal>
      )}

      {openModal === 'return' && (
        <SelectionModal title="Change return flight" onCancel={cancelModal} onConfirm={confirmModal} confirmDisabled={!pendingId}>
          <FlightLegList
            title={`${result.flights.return_flights.length} return flights available`}
            groupName="return-edit"
            legs={result.flights.return_flights}
            selectedId={pendingId}
            onSelect={setPendingId}
          />
        </SelectionModal>
      )}

      {openModal === 'hotel' && (
        <SelectionModal title="Change hotel" onCancel={cancelModal} onConfirm={confirmModal} confirmDisabled={!pendingId}>
          <HotelsList hotels={result.hotels} selectedId={pendingId} onSelect={setPendingId} />
        </SelectionModal>
      )}
    </div>
  )
}
